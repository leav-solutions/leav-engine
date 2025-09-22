// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {type ISimplePermissionHelper} from './simplePermission';
import {type IDefaultPermissionHelper} from './defaultPermission';
import {type TreePath} from '../../../_types/tree';
import {type PermissionsActions, type PermissionTypes} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import getPermissionCacheKey from './getPermissionCacheKey';
import {type ICachesService} from '../../../infra/cache/cacheService';
import {type IConfig} from '_types/config';

export interface IPermissionByUserGroupsHelperDeps {
    'core.domain.permission.helpers.simplePermission': ISimplePermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.infra.cache.cacheService': ICachesService;
    config: IConfig;
}

interface IGetPermissionByUserGroupsParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupsPaths: TreePath[]; // from the most general to the most specific (no root required)
    applyTo?: string;
    treeTarget?: {tree: string; path: TreePath}; // from the most general to the most specific (add root if needed)
    getDefaultPermission?: () => Promise<boolean> | boolean;
    ctx: IQueryInfos;
}

export interface IPermissionByUserGroupsHelper {
    getPermissionByUserGroups: (params: IGetPermissionByUserGroupsParams) => Promise<boolean>; // FIXME: the return type should be a union of boolean return type of getDefaultPermission
}

export default function (deps: IPermissionByUserGroupsHelperDeps): IPermissionByUserGroupsHelper {
    const {
        'core.domain.permission.helpers.simplePermission': simplePermHelper,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.infra.cache.cacheService': cacheService,
        config
    } = deps;

    return {
        async getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo = null,
            treeTarget = null,
            getDefaultPermission = defaultPermHelper.getDefaultPermission,
            ctx
        }: IGetPermissionByUserGroupsParams): Promise<boolean> {
            // we reverse to have this group paths order: from current user groups to the added root group
            const reversedGroupsPath = userGroupsPaths.length
                ? userGroupsPaths.map(path => [...path.reverse(), {id: null}])
                : [[{id: null}]];

            // we reverse the tree target path to have it from the current target
            let reversedTreeTargetPath: TreePath;
            if (treeTarget) {
                reversedTreeTargetPath = [...treeTarget.path].reverse();
            }

            let defaultPermission = getDefaultPermission();
            defaultPermission =
                typeof (defaultPermission as Promise<boolean>)?.then === 'function'
                    ? await defaultPermission
                    : defaultPermission;

            const _execute = async () => {
                const _getPermission = async (groupPath: TreePath, targetPath?: TreePath): Promise<boolean> => {
                    for (const group of groupPath) {
                        const groupPermission = await simplePermHelper.getSimplePermission({
                            type,
                            applyTo,
                            action,
                            usersGroupNodeId: group.id,
                            ...(!!targetPath && {
                                permissionTreeTarget: {
                                    tree: treeTarget.tree,
                                    nodeId: targetPath[0].id
                                }
                            }),
                            ctx
                        });

                        if (groupPermission !== null) {
                            return groupPermission;
                        }
                    }

                    const newTargetPath = targetPath?.slice(1);

                    if (newTargetPath?.length) {
                        return _getPermission(groupPath, newTargetPath);
                    }

                    return defaultPermission;
                };

                const userPerms = await Promise.all(
                    reversedGroupsPath.map(groupPath => _getPermission(groupPath, reversedTreeTargetPath))
                );

                // The user may have multiple groups with different permissions. We must reduce them to a single permission
                return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
            };

            if (config.permissions.enableCache) {
                // generate a cache key based on params
                const key = reversedTreeTargetPath?.length
                    ? `${treeTarget.tree}:${reversedTreeTargetPath.map(({id}) => id).join('_')}:default_${defaultPermission}`
                    : `default_${defaultPermission}`;
                const cacheKey = getPermissionCacheKey(
                    reversedGroupsPath.map(path => path[0].id),
                    type,
                    applyTo,
                    action,
                    key
                );

                return cacheService.memoize({key: cacheKey, func: _execute, storeNulls: false, ctx});
            }

            return _execute();
        }
    };
}
