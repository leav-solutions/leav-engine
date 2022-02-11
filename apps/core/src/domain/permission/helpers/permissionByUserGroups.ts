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

export default function(deps: IDeps): IPermissionByUserGroupsHelper {
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
                    usersGroupNodeId: null,
                    permissionTreeTarget,
                    ctx
                });

            // Retrieve permission for each user group.
            // If user has no group, retrieve permission for root level ("all users")
            const userPerms = userGroupsPaths.length
                ? await Promise.all(
                      userGroupsPaths.map(
                          async (groupPath): Promise<boolean> => {
                              return groupPath.length
                                  ? groupPath.slice().reduce(async (pathPermProm, pathNode): Promise<
                                        boolean | null
                                    > => {
                                        const pathPerm: boolean | null = await pathPermProm;

                                        const perm = await simplePermHelper.getSimplePermission({
                                            type,
                                            applyTo,
                                            action,
                                            usersGroupNodeId: pathNode.id,
                                            permissionTreeTarget,
                                            ctx
                                        });

                                        if (perm !== null) {
                                            return pathPerm || perm;
                                        }

                                        // Nothing found in tree, check on root level
                                        return _getRootPermission();
                                    }, Promise.resolve<boolean | null>(null))
                                  : _getRootPermission();
                          }
                      )
                  )
                : [await _getRootPermission()];

            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
