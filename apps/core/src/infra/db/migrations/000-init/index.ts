import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {CommonAttributes, UsersAttributes} from '../../../../_constants/systemAttributes';
import {aql} from 'arangojs';
import * as bcrypt from 'bcryptjs';
import {type i18n} from 'i18next';
import {type IPermissionRepo} from '../../../permission/permissionRepo';
import dayjs from 'dayjs';
import {type IConfig} from '../../../../_types/config';
import {type IMigration} from '../../../../_types/migration';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {adminsGroupId, filesAdminsGroupId} from '../../../../_constants/users';
import {SortOrder} from '../../../../_types/list';
import {PermissionTypes, TreeNodePermissionsActions} from '../../../../_types/permissions';
import {type IView, ViewSizes, ViewTypes} from '../../../../_types/views';
import {type IAttributeRepo} from '../../../attribute/attributeRepo';
import {type ILibraryRepo, LIB_COLLECTION_NAME} from '../../../library/libraryRepo';
import {getEdgesCollectionName, getNodesCollectionName} from '../../../tree/helpers/utils';
import {VIEWS_COLLECTION_NAME} from '../../../view/_types';
import {type IDbService} from '../../dbService';
import {coreCollections, type IMigrationCoreCollection} from './coreCollections';
import {type MigrationApplicationToCreate, systemApplications} from './systemApplications';
import {systemAttributes} from './systemAttributes';
import {systemLibraries} from './systemLibraries';
import {systemTrees} from './systemTrees';
import {createAttributes, createLibraries, createTrees} from '../../helpers/libraryUtils';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.permission'?: IPermissionRepo;
    translator?: i18n;
    config?: IConfig;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.permission': permissionRepo = null,
    translator = null,
    config = null,
}: IDeps = {}): IMigration {
    const adminUserId = '1';
    const systemUserId = String(config.defaultUserId);
    const now = dayjs().unix();

    const _createCollections = async (collections: IMigrationCoreCollection[], ctx: IQueryInfos) => {
        for (const collection of collections) {
            if (!(await dbService.collectionExists(collection.name))) {
                await dbService.createCollection(collection.name, collection.type);
            }
        }
    };

    const _createApplications = async (apps: MigrationApplicationToCreate[], ctx: IQueryInfos) => {
        for (const app of apps) {
            // Check if app already exists
            const existingApp = await dbService.execute({
                query: aql`
                    FOR app IN core_applications
                        FILTER app._key == ${app._key}
                        RETURN app
                `,
                ctx,
            });

            // If not, create it
            if (!existingApp.length) {
                await dbService.execute({
                    query: aql`INSERT ${app} INTO core_applications RETURN NEW`,
                    ctx,
                });
            }
        }
    };

    const _createUsers = async (ctx: IQueryInfos) => {
        const salt = await bcrypt.genSalt(10);
        const adminPwd = await bcrypt.hash(config.server.admin.password, salt);
        const creationMetadata = {
            created_at: now,
            modified_at: now,
            created_by: ctx.userId,
            modified_by: ctx.userId,
        };

        // System user password is randomly generated as nobody is supposed to sign in with it
        // It might be changed later on if needed
        const systemUserPwd = await bcrypt.hash(Math.random().toString(36).slice(2), salt);

        const users = [
            {
                _key: adminUserId,
                login: config.server.admin.login,
                email: config.server.admin.email,
                label: 'Admin',
                password: adminPwd,
                group: [adminsGroupId],
                active: true,
            },
            {
                _key: systemUserId,
                login: 'system',
                email: config.server.systemUser.email,
                label: 'System',
                password: systemUserPwd,
                group: [filesAdminsGroupId],
                active: true,
            },
        ];

        const usersCollec = dbService.db.collection(SystemLibraries.USERS);
        const valuesLinkCollec = dbService.db.collection('core_edge_values_links');

        for (const user of users) {
            const {group, ...userData} = user;
            const existingUser = await dbService.execute({
                query: aql`
                    FOR u IN ${usersCollec}
                        FILTER u._key == ${user._key}
                        RETURN u
                `,
                ctx,
            });

            if (!existingUser.length) {
                await dbService.execute({
                    query: aql`INSERT ${{
                        ...userData,
                        ...creationMetadata,
                    }} INTO ${usersCollec} RETURN NEW`,
                    ctx,
                });
            }

            // Add user to group
            const groupNodeId = `${getNodesCollectionName(SystemTrees.USERS_GROUPS)}/${group}`;
            const userDbId = `users/${user._key}`;
            const linkFromDb = await dbService.execute({
                query: aql`
                    FOR link IN ${valuesLinkCollec}
                        FILTER link._from == ${userDbId} AND link._to == ${groupNodeId}
                        RETURN link
                `,
                ctx,
            });

            if (!linkFromDb.length) {
                await dbService.execute({
                    query: aql`
                        INSERT {
                            _from: ${userDbId},
                            _to: ${groupNodeId},
                            attribute: ${UsersAttributes.USER_GROUPS},
                            created_at: ${creationMetadata.created_at},
                            modified_at: ${creationMetadata.modified_at},
                            created_by: ${creationMetadata.created_by},
                            modified_by: ${creationMetadata.modified_by}
                        } IN ${valuesLinkCollec}
                    `,
                    ctx,
                });
            }
        }
    };

    const _createUsersGroups = async (ctx: IQueryInfos) => {
        // Create users group
        const groups = [
            {
                id: adminsGroupId,
                label: translator.t('default.admin_users_group_label', {lng: ctx.lang}),
            },
            {
                id: filesAdminsGroupId,
                label: translator.t('files.default_users_group_label', {lng: ctx.lang}),
            },
        ];

        const usersGroupsLibCollec = dbService.db.collection(SystemLibraries.USERS_GROUPS);
        const usersGroupsNodeCollec = dbService.db.collection(getNodesCollectionName(SystemTrees.USERS_GROUPS));
        for (const group of groups) {
            const groupFromDb = await dbService.execute({
                query: aql`
                    FOR group IN users_groups
                        FILTER group._key == ${group.id}
                        RETURN group
                `,
                ctx,
            });

            let groupRecord;
            if (!groupFromDb.length) {
                const resInsertAdminGroupRecord = await dbService.execute({
                    query: aql`
                        INSERT {
                            _key: ${group.id},
                            created_at: ${now},
                            modified_at: ${now},
                            created_by: ${ctx.userId},
                            modified_by: ${ctx.userId},
                            label: ${group.label},
                            active: true
                        } IN ${usersGroupsLibCollec}
                        RETURN NEW
                    `,
                    ctx,
                });
                groupRecord = resInsertAdminGroupRecord[0];
            } else {
                groupRecord = groupFromDb[0];
            }

            const groupNodeFromDb = await dbService.execute({
                query: aql`
                    FOR node IN ${usersGroupsNodeCollec}
                        FILTER node.recordId == ${groupRecord._key}
                        RETURN node
                `,
                ctx,
            });

            let groupNode;
            if (!groupNodeFromDb.length) {
                const resInsertAdminGroupNode = await dbService.execute({
                    query: aql`
                            INSERT {
                                _key: ${groupRecord._key},
                                libraryId: ${SystemLibraries.USERS_GROUPS},
                                recordId: ${groupRecord._key},
                            } IN ${usersGroupsNodeCollec}
                            RETURN NEW
                        `,
                    ctx,
                });

                groupNode = resInsertAdminGroupNode[0];
            } else {
                groupNode = groupNodeFromDb[0];
            }

            // Insert node in tree
            const usersGroupsEdgeCollec = dbService.db.collection(getEdgesCollectionName(SystemTrees.USERS_GROUPS));
            const edgeFromDb = await dbService.execute({
                query: aql`
                    FOR edge IN ${usersGroupsEdgeCollec}
                        FILTER edge._from == ${groupNode._id} AND edge._to == ${groupNode._id}
                        RETURN edge
                `,
                ctx,
            });

            if (!edgeFromDb.length) {
                await dbService.execute({
                    query: aql`INSERT {
                        _from: 'core_trees/users_groups',
                        _to: ${groupNode._id}
                    } IN ${usersGroupsEdgeCollec}`,
                    ctx,
                });
            }
        }
    };

    return {
        async run(ctx) {
            await _createCollections(coreCollections, ctx);
            await createAttributes(systemAttributes, attributeRepo, ctx);
            await createLibraries(systemLibraries, dbService, libraryRepo, ctx);
            await createTrees(systemTrees, dbService, ctx);
            await _createUsersGroups(ctx);
            await _createUsers(ctx);
            await _createApplications(systemApplications, ctx);

            // Set permissions on files tree
            const filesTree = (
                await dbService.execute({
                    query: aql`
                FOR tree IN core_trees
                    FILTER tree.behavior == 'files'
                    RETURN tree
            `,
                    ctx,
                })
            )[0];

            // Define permissions on tree: forbidden for everyone except admin group
            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.TREE,
                    applyTo: filesTree._key,
                    actions: {
                        [TreeNodePermissionsActions.DETACH]: false,
                        [TreeNodePermissionsActions.EDIT_CHILDREN]: false,
                    },
                    usersGroup: null,
                    permissionTreeTarget: null,
                },
                ctx,
            });

            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.TREE,
                    applyTo: filesTree._key,
                    actions: {
                        [TreeNodePermissionsActions.DETACH]: true,
                        [TreeNodePermissionsActions.EDIT_CHILDREN]: true,
                    },
                    usersGroup: filesAdminsGroupId,
                    permissionTreeTarget: null,
                },
                ctx,
            });

            const treeLibraries = Object.keys(filesTree.libraries);
            for (const treeLibrary of treeLibraries) {
                // Define permissions for each library used in tree: forbidden for everyone except admin group
                await permissionRepo.savePermission({
                    permData: {
                        type: PermissionTypes.TREE_LIBRARY,
                        applyTo: `${filesTree._key}/${treeLibrary}`,
                        actions: {
                            [TreeNodePermissionsActions.DETACH]: false,
                            [TreeNodePermissionsActions.EDIT_CHILDREN]: false,
                        },
                        usersGroup: null,
                        permissionTreeTarget: null,
                    },
                    ctx,
                });

                await permissionRepo.savePermission({
                    permData: {
                        type: PermissionTypes.TREE_LIBRARY,
                        applyTo: `${filesTree._key}/${treeLibrary}`,
                        actions: {
                            [TreeNodePermissionsActions.DETACH]: true,
                            [TreeNodePermissionsActions.EDIT_CHILDREN]: true,
                        },
                        usersGroup: filesAdminsGroupId,
                        permissionTreeTarget: null,
                    },
                    ctx,
                });
            }

            // Create grid view for files library
            const filesDefaultView: IView = {
                label: {fr: 'Vue mosaique', en: 'Mosaic view'},
                display: {type: ViewTypes.CARDS, size: ViewSizes.MEDIUM},
                created_by: ctx.userId,
                created_at: now,
                modified_at: now,
                shared: true,
                library: SystemLibraries.FILES,
                attributes: [],
                filters: [],
                sort: [
                    {
                        field: CommonAttributes.ID,
                        order: SortOrder.ASC,
                    },
                ],
                description: null,
                color: null,
            };

            const viewsCollec = dbService.db.collection(VIEWS_COLLECTION_NAME);
            const createdView = await dbService.execute({
                query: aql`INSERT ${filesDefaultView} INTO ${viewsCollec} RETURN NEW`,
                ctx,
            });
            const viewId = createdView[0]._key;

            // Set it as default
            const libsCollec = dbService.db.collection(LIB_COLLECTION_NAME);
            await dbService.execute({
                query: aql`
                        UPDATE ${{_key: SystemLibraries.FILES}}
                            WITH ${{defaultView: viewId}}
                            IN ${libsCollec}
                        RETURN NEW`,
                ctx,
            });
        },
    };
}
