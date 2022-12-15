// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import * as bcrypt from 'bcryptjs';
import {i18n} from 'i18next';
import {IApplicationService} from 'infra/application/applicationService';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import moment from 'moment';
import {IConfig} from '_types/config';
import {IMigration} from '_types/migration';
import {IQueryInfos} from '_types/queryInfos';
import {adminsGroupId, filesAdminsGroupId} from '../../../../_constants/userGroups';
import {SortOrder} from '../../../../_types/list';
import {PermissionTypes, TreeNodePermissionsActions} from '../../../../_types/permissions';
import {ViewSizes, ViewTypes} from '../../../../_types/views';
import {IAttributeForRepo, IAttributeRepo} from '../../../attribute/attributeRepo';
import {ILibraryRepo, LIB_COLLECTION_NAME} from '../../../library/libraryRepo';
import {getEdgesCollectionName, getNodesCollectionName} from '../../../tree/helpers/utils';
import {VIEWS_COLLECTION_NAME} from '../../../view/_types';
import {collectionTypes, IDbService} from '../../dbService';
import {coreCollections, IMigrationCoreCollection} from './coreCollections';
import {MigrationApplicationToCreate, systemApplications} from './systemApplications';
import {systemAttributes} from './systemAttributes';
import {MigrationLibraryToCreate, systemLibraries} from './systemLibraries';
import {MigrationTreeToCreate, systemTrees} from './systemTrees';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.application.service'?: IApplicationService;
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    translator?: i18n;
    config?: IConfig;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.permission': permissionRepo = null,
    'core.infra.application.service': applicationService = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    translator = null,
    config = null
}: IDeps = {}): IMigration {
    const adminUserId = '1';
    const systemUserId = String(config.defaultUserId);
    const now = moment().unix();

    const _createAttributes = async (attributes: IAttributeForRepo[], ctx: IQueryInfos) => {
        for (const attribute of attributes) {
            // Check if attribute already exists
            const attributeFromDb = await attributeRepo.getAttributes({
                params: {
                    filters: {
                        id: attribute.id
                    },
                    strictFilters: true,
                    withCount: false
                },
                ctx
            });

            // It already exists, move on
            if (attributeFromDb.list.length) {
                continue;
            }

            // Let's create it
            await attributeRepo.createAttribute({
                attrData: {...attribute},
                ctx
            });
        }
    };

    const _createCollections = async (collections: IMigrationCoreCollection[], ctx: IQueryInfos) => {
        for (const collection of collections) {
            if (!(await dbService.collectionExists(collection.name))) {
                await dbService.createCollection(collection.name, collection.type);
            }
        }
    };

    const _createLibraries = async (libraries: MigrationLibraryToCreate[], ctx: IQueryInfos) => {
        for (const lib of libraries) {
            // Check if library already exists
            const libsCollec = await dbService.db.collection(LIB_COLLECTION_NAME);
            const existingLib = await dbService.execute({
                query: aql`
                    FOR lib IN ${libsCollec}
                        FILTER lib._key == ${lib._key}
                        RETURN lib
                `,
                ctx
            });

            // If not, create it
            if (!existingLib.length) {
                const {attributes, fullTextAttributes, ...libData} = lib;
                // Insert in libraries collection
                await dbService.execute({
                    query: aql`INSERT ${libData} INTO ${libsCollec} RETURN NEW`,
                    ctx
                });

                // Save its attributes
                await libraryRepo.saveLibraryAttributes({
                    libId: lib._key,
                    attributes,
                    ctx
                });

                await libraryRepo.saveLibraryFullTextAttributes({
                    libId: lib._key,
                    fullTextAttributes,
                    ctx
                });
            }

            // Ensure collection exists for this library
            if (!(await dbService.collectionExists(lib._key))) {
                await dbService.createCollection(lib._key);
            }

            // Ensure elasticsearch index exists for this library
            const doesIndexExist = await elasticsearchService.indiceExists(lib._key);
            if (!doesIndexExist) {
                await elasticsearchService.indiceCreate(lib._key);
            }
        }
    };

    const _createTrees = async (trees: MigrationTreeToCreate[], ctx: IQueryInfos) => {
        for (const tree of trees) {
            const treeFromDb = await dbService.execute({
                query: aql`
                    FOR t IN core_trees
                        FILTER t._key == ${tree._key}
                    RETURN t._key
                `,
                ctx
            });

            if (!treeFromDb.length) {
                await dbService.execute({
                    query: aql`INSERT ${tree} INTO core_trees RETURN NEW`,
                    ctx
                });
            }

            const edgeCollecName = `core_edge_tree_${tree._key}`;
            if (!(await dbService.collectionExists(edgeCollecName))) {
                await dbService.createCollection(edgeCollecName, collectionTypes.EDGE);
            }

            const nodesCollectionName = getNodesCollectionName(tree._key);
            if (!(await dbService.collectionExists(nodesCollectionName))) {
                await dbService.createCollection(nodesCollectionName);
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
                ctx
            });

            // If not, create it
            if (!existingApp.length) {
                await dbService.execute({
                    query: aql`INSERT ${app} INTO core_applications RETURN NEW`,
                    ctx
                });
            }
        }

        //Install Applications
        await applicationService.runInstallAll();
    };

    const _createUsers = async (ctx: IQueryInfos) => {
        const salt = await bcrypt.genSalt(10);
        const adminPwd = await bcrypt.hash(config.server.admin.password, salt);
        const creationMetadata = {
            created_at: now,
            modified_at: now,
            created_by: ctx.userId,
            modified_by: ctx.userId
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
                active: true
            },
            {
                _key: systemUserId,
                login: 'system',
                email: config.server.systemUser.email,
                label: 'System',
                password: systemUserPwd,
                group: [filesAdminsGroupId],
                active: true
            }
        ];

        const usersCollec = dbService.db.collection('users');
        const valuesLinkCollec = dbService.db.collection('core_edge_values_links');
        for (const user of users) {
            const {group, ...userData} = user;
            const existingUser = await dbService.execute({
                query: aql`
                    FOR u IN ${usersCollec}
                        FILTER u._key == ${user._key}
                        RETURN u
                `,
                ctx
            });

            if (!existingUser.length) {
                await dbService.execute({
                    query: aql`INSERT ${{
                        ...userData,
                        ...creationMetadata
                    }} INTO ${usersCollec} RETURN NEW`,
                    ctx
                });
            }

            // Add user to group
            const groupNodeId = `${getNodesCollectionName('users_groups')}/${group}`;
            const userDbId = `users/${user._key}`;
            const linkFromDb = await dbService.execute({
                query: aql`
                    FOR link IN ${valuesLinkCollec}
                        FILTER link._from == ${userDbId} AND link._to == ${groupNodeId}
                        RETURN link
                `,
                ctx
            });

            if (!linkFromDb.length) {
                await dbService.execute({
                    query: aql`
                        INSERT {
                            _from: ${userDbId},
                            _to: ${groupNodeId},
                            attribute: 'user_groups',
                            created_at: ${creationMetadata.created_at},
                            modified_at: ${creationMetadata.modified_at},
                            created_by: ${creationMetadata.created_by},
                            modified_by: ${creationMetadata.modified_by}
                        } IN ${valuesLinkCollec}
                    `,
                    ctx
                });
            }

            await elasticsearchService.indexData('users', user._key, {
                login: user.login,
                email: user.email,
                label: user.label
            });
        }
    };

    const _createUsersGroups = async (ctx: IQueryInfos) => {
        // Create users group
        const groups = [
            {
                id: adminsGroupId,
                label: translator.t('default.admin_users_group_label')
            },
            {
                id: filesAdminsGroupId,
                label: translator.t('files.default_users_group_label')
            }
        ];

        const usersGroupsLibCollec = dbService.db.collection('users_groups');
        const usersGroupsNodeCollec = dbService.db.collection(getNodesCollectionName('users_groups'));
        for (const group of groups) {
            const groupFromDb = await dbService.execute({
                query: aql`
                    FOR group IN users_groups
                        FILTER group._key == ${group.id}
                        RETURN group
                `,
                ctx
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
                    ctx
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
                ctx
            });

            let groupNode;
            if (!groupNodeFromDb.length) {
                const resInsertAdminGroupNode = await dbService.execute({
                    query: aql`
                            INSERT {
                                _key: ${groupRecord._key},
                                libraryId: 'users_groups',
                                recordId: ${groupRecord._key},
                            } IN ${usersGroupsNodeCollec}
                            RETURN NEW
                        `,
                    ctx
                });

                groupNode = resInsertAdminGroupNode[0];
            } else {
                groupNode = groupNodeFromDb[0];
            }

            // Insert node in tree
            const usersGroupsEdgeCollec = dbService.db.collection(getEdgesCollectionName('users_groups'));
            const edgeFromDb = await dbService.execute({
                query: aql`
                    FOR edge IN ${usersGroupsEdgeCollec}
                        FILTER edge._from == ${groupNode._id} AND edge._to == ${groupNode._id}
                        RETURN edge
                `,
                ctx
            });

            if (!edgeFromDb.length) {
                await dbService.execute({
                    query: aql`INSERT {
                        _from: 'core_trees/users_groups',
                        _to: ${groupNode._id}
                    } IN ${usersGroupsEdgeCollec}`,
                    ctx
                });
            }

            await elasticsearchService.indexData('users_groups', groupRecord._key, {
                label: groupRecord.label
            });
        }
    };

    return {
        async run(ctx) {
            await _createCollections(coreCollections, ctx);
            await _createAttributes(systemAttributes, ctx);
            await _createLibraries(systemLibraries, ctx);
            await _createTrees(systemTrees, ctx);
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
                    ctx
                })
            )[0];

            // Define permissions on tree: forbidden for everyone except admin group
            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.TREE,
                    applyTo: filesTree._key,
                    actions: {
                        [TreeNodePermissionsActions.DETACH]: false,
                        [TreeNodePermissionsActions.EDIT_CHILDREN]: false
                    },
                    usersGroup: null,
                    permissionTreeTarget: null
                },
                ctx
            });

            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.TREE,
                    applyTo: filesTree._key,
                    actions: {
                        [TreeNodePermissionsActions.DETACH]: true,
                        [TreeNodePermissionsActions.EDIT_CHILDREN]: true
                    },
                    usersGroup: filesAdminsGroupId,
                    permissionTreeTarget: null
                },
                ctx
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
                            [TreeNodePermissionsActions.EDIT_CHILDREN]: false
                        },
                        usersGroup: null,
                        permissionTreeTarget: null
                    },
                    ctx
                });

                await permissionRepo.savePermission({
                    permData: {
                        type: PermissionTypes.TREE_LIBRARY,
                        applyTo: `${filesTree._key}/${treeLibrary}`,
                        actions: {
                            [TreeNodePermissionsActions.DETACH]: true,
                            [TreeNodePermissionsActions.EDIT_CHILDREN]: true
                        },
                        usersGroup: filesAdminsGroupId,
                        permissionTreeTarget: null
                    },
                    ctx
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
                library: 'files',
                settings: {},
                filters: [],
                sort: {
                    field: 'id',
                    order: SortOrder.ASC
                },
                description: null,
                color: null
            };

            const viewsCollec = dbService.db.collection(VIEWS_COLLECTION_NAME);
            const createdView = await dbService.execute({
                query: aql`INSERT ${filesDefaultView} INTO ${viewsCollec} RETURN NEW`,
                ctx
            });
            const viewId = createdView[0]._key;

            // Set it as default
            const libsCollec = dbService.db.collection(LIB_COLLECTION_NAME);
            await dbService.execute({
                query: aql`
                        UPDATE ${{_key: 'files'}}
                            WITH ${{defaultView: viewId}}
                            IN ${libsCollec}
                        RETURN NEW`,
                ctx
            });
        }
    };
}
