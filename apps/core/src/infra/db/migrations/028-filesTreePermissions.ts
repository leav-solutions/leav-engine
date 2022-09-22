// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {i18n} from 'i18next';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IMigration} from '_types/migration';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {PermissionTypes, TreeNodePermissionsActions} from '../../../_types/permissions';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.value'?: IValueRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.permission'?: IPermissionRepo;
    'core.utils'?: IUtils;
    config?: IConfig;
    translator?: i18n;
}

export default function ({
    'core.infra.attribute': attributeRepo = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.value': valueRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.permission': permissionRepo = null,
    'core.utils': utils = null,
    config = null,
    translator = null
}: IDeps): IMigration {
    return {
        async run(ctx) {
            const adminsUsersGroupId = '1';

            // Create "label" attribute if it doesn't exist
            const labelAttributeData = {
                id: 'label',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {fr: 'Libellé', en: 'Label'},
                system: true,
                multiple_values: false,
                readonly: false
            };

            const attributeFromDb = await dbService.execute({
                query: aql`
                    FOR attribute IN core_attributes
                        FILTER attribute._key == ${labelAttributeData.id}
                        RETURN attribute
                `,
                ctx
            });

            // It doesn't already exists, create it
            if (!attributeFromDb.length) {
                await attributeRepo.createAttribute({
                    attrData: {
                        ...labelAttributeData,
                        actions_list: utils.getDefaultActionsList(labelAttributeData)
                    },
                    ctx
                });
            }

            // Create automate admin users group
            const groupFromDb = await dbService.execute({
                query: aql`
                    FOR group IN users_groups
                        FILTER group._key == ${adminsUsersGroupId}
                        RETURN group
                `,
                ctx
            });

            let adminsGroupTreeNodeId: string;
            if (!groupFromDb.length) {
                await dbService.execute({
                    query: aql`
                        INSERT {
                            _key: ${adminsUsersGroupId},
                            active: true,
                            created_at: ${moment().unix()},
                            modified_at: ${moment().unix()},
                            created_by: '1',
                            modified_by: '1',
                            label: ${translator.t('files.default_users_group_label')}
                        } IN users_groups
                        RETURN NEW
                    `,
                    ctx
                });

                adminsGroupTreeNodeId = (
                    await treeRepo.addElement({
                        treeId: 'users_groups',
                        element: {
                            id: adminsUsersGroupId,
                            library: 'users_groups'
                        },
                        parent: null,
                        ctx
                    })
                ).id;
            } else {
                adminsGroupTreeNodeId = (
                    await treeRepo.getNodesByRecord({
                        treeId: 'users_groups',
                        record: {
                            id: adminsUsersGroupId,
                            library: 'users_groups'
                        },
                        ctx
                    })
                )[0];
            }

            // Create system user
            const userFromDb = await dbService.execute({
                query: aql`
                    FOR user IN users
                        FILTER user._key == ${config.defaultUserId}
                        RETURN user
                `,
                ctx
            });

            if (!userFromDb.length) {
                await dbService.execute({
                    query: aql`
                        INSERT {
                            _key: ${String(config.defaultUserId)},
                            active: true,
                            created_at: ${moment().unix()},
                            modified_at: ${moment().unix()},
                            created_by: ${String(config.defaultUserId)},
                            modified_by: ${String(config.defaultUserId)},
                            login: 'system',
                        } IN users
                        RETURN NEW
                    `,
                    ctx
                });
            }

            // Add user to group
            const groupAttribute = (
                await attributeRepo.getAttributes({
                    params: {filters: {id: 'user_groups'}},
                    ctx
                })
            ).list[0];

            const userGroupFromDb = await valueRepo.getValues({
                library: 'users',
                recordId: config.defaultUserId,
                attribute: {...groupAttribute, reverse_link: null},
                options: {
                    forceArray: true
                },
                ctx
            });

            if (!userGroupFromDb.length) {
                await valueRepo.createValue({
                    library: 'users',
                    recordId: config.defaultUserId,
                    attribute: {...groupAttribute, reverse_link: null},
                    value: {
                        created_at: moment().unix(),
                        modified_at: moment().unix(),
                        value: adminsGroupTreeNodeId
                    },
                    ctx
                });
            }

            const filesTrees = await dbService.execute({
                query: aql`
                FOR tree IN core_trees
                    FILTER tree.behavior == 'files'
                    RETURN tree
            `,
                ctx
            });

            for (const tree of filesTrees) {
                // Define permissions on tree: forbidden for everyone except admin group
                await permissionRepo.savePermission({
                    permData: {
                        type: PermissionTypes.TREE,
                        applyTo: tree._key,
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
                        applyTo: tree._key,
                        actions: {
                            [TreeNodePermissionsActions.DETACH]: true,
                            [TreeNodePermissionsActions.EDIT_CHILDREN]: true
                        },
                        usersGroup: adminsGroupTreeNodeId,
                        permissionTreeTarget: null
                    },
                    ctx
                });

                const treeLibraries = Object.keys(tree.libraries);
                for (const treeLibrary of treeLibraries) {
                    // Define permissions for each library used in tree: forbidden for everyone except admin group
                    await permissionRepo.savePermission({
                        permData: {
                            type: PermissionTypes.TREE_LIBRARY,
                            applyTo: `${tree._key}/${treeLibrary}`,
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
                            applyTo: `${tree._key}/${treeLibrary}`,
                            actions: {
                                [TreeNodePermissionsActions.DETACH]: true,
                                [TreeNodePermissionsActions.EDIT_CHILDREN]: true
                            },
                            usersGroup: adminsGroupTreeNodeId,
                            permissionTreeTarget: null
                        },
                        ctx
                    });
                }
            }
        }
    };
}
