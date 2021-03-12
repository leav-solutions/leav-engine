// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode, TreePaths} from '_types/tree';
import {PermissionsActions, PermissionsRelations, PermissionTypes} from '../../../_types/permissions';
import {IGetHeritedTreeBasedPermissionParams, IGetTreeBasedPermissionParams} from '../_types';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray'?: IReducePermissionsArrayHelper;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.value'?: IValueRepo;
    config?: IConfig;
}

export interface ITreeBasedPermissionHelper {
    getTreeBasedPermission(params: IGetTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getHeritedTreeBasedPermission(params: IGetHeritedTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export default function (deps: IDeps): ITreeBasedPermissionHelper {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null,
        config = null
    } = deps;

    /**
     * Return permission for given permission tree attribute.
     * Get record's value on this tree attribute, then run through its ancestors to look for any permission defined
     *
     * @param params
     */
    const _getPermTreePermission = async (params: {
        type: PermissionTypes;
        action: PermissionsActions;
        applyTo: string;
        userGroupsPaths: TreePaths[];
        permTreeId: string;
        permTreeValues: ITreeNode[];
        ctx: IQueryInfos;
    }): Promise<boolean | null> => {
        const {type, action, applyTo, userGroupsPaths, permTreeId, permTreeValues, ctx} = params;

        if (permTreeValues.length) {
            // Get permissions for all values, then check if we're allowed somewhere
            const allValuesPermissions = await Promise.all(
                permTreeValues.map(
                    // Permissions for each values of tree attribute
                    async (value): Promise<boolean | null> => {
                        const permTreePaths = await treeRepo.getElementAncestors({
                            // Ancestors of value
                            treeId: permTreeId,
                            element: {
                                id: value.record.id,
                                library: value.record.library
                            },
                            ctx
                        });

                        const pathsPerm = await permTreePaths.reduce(async (globalPathsPerm, permTreePath) => {
                            // Permission for each path of value
                            const gPP = await globalPathsPerm;

                            let pathPerm = null;
                            // Get permission for this path: start from the bottom and go up to the root. Stop at first permissions defined
                            for (const pathElem of permTreePath.reverse()) {
                                const valuePerm = await permByUserGroupsHelper.getPermissionByUserGroups({
                                    type,
                                    action,
                                    userGroupsPaths,
                                    applyTo,
                                    permissionTreeTarget: {
                                        id: pathElem.record.id,
                                        library: pathElem.record.library,
                                        tree: permTreeId
                                    },
                                    ctx
                                });

                                if (valuePerm !== null) {
                                    pathPerm = valuePerm;
                                    break;
                                }
                            }

                            return Promise.resolve(!gPP ? pathPerm : gPP);
                        }, Promise.resolve(null));

                        return pathsPerm;
                    }
                )
            );

            // Looks for a true somewhere, but keeps null if everything is null
            const perm = reducePermissionsArrayHelper.reducePermissionsArray(allValuesPermissions);

            if (perm !== null) {
                return perm;
            }
        }

        // Nothing found on tree or no value defined, return root level permission
        const rootPerm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo,
            permissionTreeTarget: {
                id: null,
                library: null,
                tree: permTreeId
            },
            ctx
        });

        return rootPerm;
    };

    const getTreeBasedPermission = async (
        params: IGetTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

        if (!permissions_conf.permissionTreeAttributes.length) {
            return getDefaultPermission({action, applyTo, userId});
        }

        const userGroupAttr = await attributeDomain.getAttributeProperties({id: 'user_groups', ctx});

        // Get user group, retrieve ancestors
        const userGroups = await valueRepo.getValues({
            library: 'users',
            recordId: userId,
            attribute: userGroupAttr,
            ctx
        });

        const userGroupsPaths = await Promise.all(
            userGroups.map(userGroupVal =>
                treeRepo.getElementAncestors({
                    treeId: 'users_groups',
                    element: {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    },
                    ctx
                })
            )
        );

        const treePerms = await Promise.all(
            permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                const treePerm = await _getPermTreePermission({
                    type,
                    action,
                    applyTo,
                    userGroupsPaths,
                    permTreeId: permTreeAttrProps.linked_tree,
                    permTreeValues: treeValues[permTreeAttr],
                    ctx
                });

                if (treePerm !== null) {
                    return treePerm;
                }

                return getDefaultPermission({action, applyTo, userId});
            })
        );

        const perm = treePerms.reduce((globalPerm, treePerm) => {
            if (globalPerm === null) {
                return treePerm;
            }

            return permissions_conf.relation === PermissionsRelations.AND
                ? globalPerm && treePerm
                : globalPerm || treePerm;
        }, null);

        return perm;
    };

    const getHeritedTreeBasedPermission = async (
        params: IGetHeritedTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

        // Get perm for user group's parent
        const groupAncestors = await treeRepo.getElementAncestors({
            treeId: 'users_groups',
            element: {
                id: userGroupId,
                library: 'users_groups'
            },
            ctx
        });

        const parentPerm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths: [groupAncestors.map(g => g.slice(0, -1))], // Start from parent group
            applyTo,
            permissionTreeTarget,
            ctx
        });

        if (parentPerm !== null) {
            return parentPerm;
        }

        const treeElemAncestors = await treeRepo.getElementAncestors({
            treeId: permissionTreeTarget.tree,
            element: {
                id: permissionTreeTarget.id,
                library: permissionTreeTarget.library
            },
            ctx
        });

        const perm = await treeElemAncestors.reduce(async (globalPerm, treeAncElem) => {
            const gP = await globalPerm;

            const ancPerm = await _getPermTreePermission({
                type,
                action,
                applyTo,
                userGroupsPaths: [groupAncestors],
                permTreeId: permissionTreeTarget.tree,
                permTreeValues: treeAncElem.slice(0, -1).reverse(),
                ctx
            });

            return Promise.resolve(gP || ancPerm);
        }, Promise.resolve(null));

        if (perm !== null) {
            return perm;
        }

        // Nothing found? Return library permission
        const libPerm = await getDefaultPermission({
            action,
            applyTo,
            userGroups: [groupAncestors]
        });

        return libPerm !== null ? libPerm : defaultPermHelper.getDefaultPermission();
    };

    return {
        getTreeBasedPermission,
        getHeritedTreeBasedPermission
    };
}
