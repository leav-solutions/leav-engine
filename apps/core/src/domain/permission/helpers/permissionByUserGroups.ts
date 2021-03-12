// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetPermissionByUserGroupsParams} from '../_types';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {ISimplePermissionHelper} from './simplePermission';

interface IDeps {
    'core.domain.permission.helpers.simplePermission': ISimplePermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.infra.permission'?: IPermissionRepo;
}

export interface IPermissionByUserGroupsHelper {
    getPermissionByUserGroups: (params: IGetPermissionByUserGroupsParams) => Promise<boolean | null>;
}

export default function (deps: IDeps): IPermissionByUserGroupsHelper {
    const {
        'core.domain.permission.helpers.simplePermission': simplePermHelper = null,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper
    } = deps;

    return {
        async getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo = null,
            permissionTreeTarget = null,
            ctx
        }: IGetPermissionByUserGroupsParams): Promise<boolean | null> {
            const _getRootPermission = () =>
                simplePermHelper.getSimplePermission({
                    type,
                    applyTo,
                    action,
                    usersGroupId: null,
                    permissionTreeTarget,
                    ctx
                });

            // Retrieve permission for each user group.
            // If user has no group, retrieve permission for root level ("all users")
            const userPerms = userGroupsPaths.length
                ? await Promise.all(
                      userGroupsPaths.map(
                          async (groupPaths): Promise<boolean> => {
                              return groupPaths.length
                                  ? groupPaths.reduce(async (globalPerm, groupPath) => {
                                        const gP = await globalPerm;

                                        for (const group of groupPath.slice().reverse()) {
                                            const perm = await simplePermHelper.getSimplePermission({
                                                type,
                                                applyTo,
                                                action,
                                                usersGroupId: group.record.id,
                                                permissionTreeTarget,
                                                ctx
                                            });

                                            if (perm !== null) {
                                                return Promise.resolve(gP || perm);
                                            }
                                        }

                                        // Nothing found in tree, check on root level
                                        return _getRootPermission();
                                    }, Promise.resolve(null))
                                  : _getRootPermission();
                          }
                      )
                  )
                : [await _getRootPermission()];

            // If user is allowed at least once among all his groups (whether a defined permission or default config)
            //    => return true
            // Otherwise, if user is forbidden at least once
            //    => return false
            // If no permission defined for all groups
            //    => return null
            // const userPerm = userPerms.reduce((globalPerm, groupPerm) => {
            //     if (globalPerm || groupPerm) {
            //         return true;
            //     } else if (globalPerm === groupPerm || (globalPerm === null && !groupPerm)) {
            //         return groupPerm;
            //     }

            //     return globalPerm;
            // }, null);

            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
