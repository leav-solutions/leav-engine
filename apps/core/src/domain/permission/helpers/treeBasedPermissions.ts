// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IQueryInfos} from '_types/queryInfos';
import {TreePaths} from '_types/tree';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';
import {PermissionsActions, PermissionsRelations, PermissionTypes} from '../../../_types/permissions';
import {IGetInheritedTreeBasedPermissionParams, IGetTreeBasedPermissionParams} from '../_types';
import {IDefaultPermissionHelper} from './defaultPermission';
import getPermissionCacheKey from './getPermissionCacheKey';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';

export interface ITreeBasedPermissionsDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.permission': IPermissionRepo;
    'core.infra.cache.cacheService': ICachesService;
}

export interface ITreeBasedPermissionHelper {
    getTreeBasedPermission(params: IGetTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getInheritedTreeBasedPermission(params: IGetInheritedTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export default function (deps: ITreeBasedPermissionsDeps): ITreeBasedPermissionHelper {
    const {
        'core.domain.attribute': attributeDomain,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper,
        'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
        'core.infra.cache.cacheService': cacheService
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
        permTreeValues: string[];
        getDefaultPermission: () => Promise<boolean> | boolean;
        ctx: IQueryInfos;
    }): Promise<boolean> => {
        const {type, action, applyTo, userGroupsPaths, permTreeId, permTreeValues, getDefaultPermission, ctx} = params;

        // Get permissions for all values, then check if we're allowed somewhere
        const allValuesPermissions = await Promise.all(
            // if there is no values, we get the tree target root permission
            (permTreeValues.length ? permTreeValues : [null]).map(
                // Permissions for each values of tree attribute
                async (value): Promise<boolean> => {
                    const targetPath = await elementAncestorsHelper.getCachedElementAncestors({
                        treeId: permTreeId,
                        nodeId: value,
                        ctx
                    });

                    return permByUserGroupsHelper.getPermissionByUserGroups({
                        type,
                        action,
                        userGroupsPaths,
                        applyTo,
                        treeTarget: {
                            path: [{id: null}, ...targetPath],
                            tree: permTreeId
                        },
                        getDefaultPermission,
                        ctx
                    });
                }
            )
        );

        return reducePermissionsArrayHelper.reducePermissionsArray(allValuesPermissions);
    };

    const getTreeBasedPermission = async (
        params: IGetTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

        if (!permissions_conf.permissionTreeAttributes.length) {
            return getDefaultPermission({action, applyTo, userId});
        }

        const key = permissions_conf.permissionTreeAttributes.reduce((acc, permTreeAttr) => {
            const values = treeValues[permTreeAttr];
            return values.length ? acc + `${acc.length ? '_' : ''}${values.join('_')}` : acc;
        }, '');

        // disable cache temporary: const cacheKey = getPermissionCacheKey(ctx.groupsId, type, applyTo, action, key);
        // disable cache temporary: const permFromCache = (await cacheService.getCache(ECacheType.RAM).getData([cacheKey]))[0];
        // disable cache temporary: let perm: boolean;

        /* disable cache temporary: if (permFromCache !== null) {
            perm = permFromCache === 'true';
        } else { */
        const userGroupsPaths = !!ctx.groupsId
            ? await Promise.all(
                  ctx.groupsId.map(async groupId =>
                      elementAncestorsHelper.getCachedElementAncestors({
                          treeId: 'users_groups',
                          nodeId: groupId,
                          ctx
                      })
                  )
              )
            : [];

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
                    getDefaultPermission: () => getDefaultPermission({action, applyTo, userId}),
                    ctx
                });
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

        // disable cache temporary: await cacheService.getCache(ECacheType.RAM).storeData({key: cacheKey, data: perm.toString()});
        // }

        return perm;
    };

    const getInheritedTreeBasedPermission = async (
        params: IGetInheritedTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

        // Get perm for user group's parent
        const groupAncestors = await elementAncestorsHelper.getCachedElementAncestors({
            treeId: 'users_groups',
            nodeId: userGroupId,
            ctx
        });

        // get tree target path
        const treeTargetPath = await elementAncestorsHelper.getCachedElementAncestors({
            treeId: permissionTreeTarget.tree,
            nodeId: permissionTreeTarget.nodeId,
            ctx
        });

        const inheritedGroupTargetPermission = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths: [groupAncestors.slice(0, -1)],
            applyTo,
            treeTarget: {tree: permissionTreeTarget.tree, path: [{id: permissionTreeTarget.nodeId}]},
            getDefaultPermission: () => null,
            ctx
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
                path: [{id: null}, ...treeTargetPath.slice(0, -1)]
            },
            getDefaultPermission: () => null,
            ctx
        });

        if (inheritedTargetPathPermission !== null) {
            return inheritedTargetPathPermission;
        }

        return getDefaultPermission({action, applyTo, userGroups: [groupAncestors]});
    };

    return {
        getTreeBasedPermission,
        getInheritedTreeBasedPermission
    };
}
