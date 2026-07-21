import {SystemTrees} from '../../../_constants/systemTrees';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type IPermissionRepo} from '../../../infra/permission/permissionRepo';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type TreePath} from '../../../_types/tree';
import {type PermissionsActions, PermissionsRelations, type PermissionTypes} from '../../../_types/permissions';
import {
    type GetDefaultGlobalPermission,
    type IGetInheritedTreeBasedPermissionParams,
    type IGetTreeBasedPermissionParams,
} from '../_types';
import {type IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {type IReducePermissionsArrayHelper} from './reducePermissionsArray';

export interface ITreeBasedPermissionsDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.permission': IPermissionRepo;
}

export interface ITreeBasedPermissionHelper {
    getTreeBasedPermission(params: IGetTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getInheritedTreeBasedPermission(params: IGetInheritedTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export default function (deps: ITreeBasedPermissionsDeps): ITreeBasedPermissionHelper {
    const {
        'core.domain.attribute': attributeDomain,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper,
        'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
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
        userGroupsPaths: TreePath[];
        permTreeId: string;
        permTreeValues: string[];
        getDefaultGlobalPermission: GetDefaultGlobalPermission;
        ctx: IQueryInfos;
    }): Promise<boolean> => {
        const {type, action, applyTo, userGroupsPaths, permTreeId, permTreeValues, getDefaultGlobalPermission, ctx} =
            params;

        // Get permissions for all values, then check if we're allowed somewhere
        const allValuesPermissions = await Promise.all(
            // if there is no values, we get the tree target root permission
            (permTreeValues.length ? permTreeValues : [null]).map(
                // Permissions for each values of tree attribute
                async (value): Promise<boolean> => {
                    const targetPath = await elementAncestorsHelper.getCachedElementAncestors({
                        treeId: permTreeId,
                        nodeId: value,
                        ctx,
                    });

                    return permByUserGroupsHelper.getPermissionByUserGroups({
                        type,
                        action,
                        userGroupsPaths,
                        applyTo,
                        treeTarget: {
                            path: [{id: null}, ...targetPath],
                            tree: permTreeId,
                        },
                        getDefaultGlobalPermission,
                        ctx,
                    });
                },
            ),
        );

        return reducePermissionsArrayHelper.reducePermissionsArray(allValuesPermissions);
    };

    const getTreeBasedPermission = async (
        params: IGetTreeBasedPermissionParams,
        ctx: IQueryInfos,
    ): Promise<boolean> => {
        const {type, action, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

        const userGroupsPaths = ctx.groupsId
            ? await Promise.all(
                  ctx.groupsId.map(async groupId =>
                      elementAncestorsHelper.getCachedElementAncestors({
                          treeId: SystemTrees.USERS_GROUPS,
                          nodeId: groupId,
                          ctx,
                      }),
                  ),
              )
            : [];

        if (!permissions_conf.permissionTreeAttributes.length) {
            return getDefaultPermission({action, type, applyTo, userGroups: userGroupsPaths, ctx});
        }

        const treePerms = await Promise.all(
            permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});

                return _getPermTreePermission({
                    type,
                    action,
                    applyTo,
                    userGroupsPaths,
                    permTreeId: permTreeAttrProps.linked_tree,
                    permTreeValues: treeValues[permTreeAttr],
                    getDefaultGlobalPermission: () =>
                        getDefaultPermission({action, type, applyTo, userGroups: userGroupsPaths, ctx}),
                    ctx,
                });
            }),
        );

        return treePerms.reduce((globalPerm, treePerm) => {
            if (globalPerm === null) {
                return treePerm;
            }

            return permissions_conf.relation === PermissionsRelations.AND
                ? globalPerm && treePerm
                : globalPerm || treePerm;
        }, null);
    };

    const getInheritedTreeBasedPermission = async (
        params: IGetInheritedTreeBasedPermissionParams,
        ctx: IQueryInfos,
    ): Promise<boolean> => {
        const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

        // Get perm for user group's parent
        const groupAncestors = await elementAncestorsHelper.getCachedElementAncestors({
            treeId: SystemTrees.USERS_GROUPS,
            nodeId: userGroupId,
            ctx,
        });

        // get tree target path
        const treeTargetPath = await elementAncestorsHelper.getCachedElementAncestors({
            treeId: permissionTreeTarget.tree,
            nodeId: permissionTreeTarget.nodeId,
            ctx,
        });

        const inheritedGroupTargetPermission = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths: [groupAncestors.slice(0, -1)],
            applyTo,
            treeTarget: {tree: permissionTreeTarget.tree, path: [{id: permissionTreeTarget.nodeId}]},
            getDefaultGlobalPermission: () => null,
            ctx,
        });

        if (inheritedGroupTargetPermission !== null) {
            return inheritedGroupTargetPermission;
        }

        const inheritedTargetPathPermission = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths: [groupAncestors],
            applyTo,
            treeTarget: {
                tree: permissionTreeTarget.tree,
                path: [{id: null}, ...treeTargetPath.slice(0, -1)],
            },
            getDefaultGlobalPermission: () => null,
            ctx,
        });

        if (inheritedTargetPathPermission !== null) {
            return inheritedTargetPathPermission;
        }

        return getDefaultPermission({action, type, applyTo, userGroups: [groupAncestors], ctx});
    };

    return {
        getTreeBasedPermission,
        getInheritedTreeBasedPermission,
    };
}
