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
            // Used to retrieve permission for root level ("all users")
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
                          async (userGroupPath): Promise<boolean | null> => {
                              let userGroupPermission = null;
                              if (userGroupPath.length) {
                                  for (const groupNode of userGroupPath) {
                                      // Check if this group node has a permission defined on it
                                      const groupNodePermission = await simplePermHelper.getSimplePermission({
                                          type,
                                          applyTo,
                                          action,
                                          usersGroupNodeId: groupNode.id,
                                          permissionTreeTarget,
                                          ctx
                                      });

                                      // We stop on the first group node with a permission defined (null == inherited)
                                      if (groupNodePermission !== null) {
                                          userGroupPermission = groupNodePermission;
                                          break;
                                      }
                                  }
                              }

                              // If no permission was found on any group, retrieve permission for root level ("all users")
                              if (userGroupPermission === null) {
                                  userGroupPermission = await _getRootPermission();
                              }

                              return userGroupPermission;
                          }
                      )
                  )
                : [await _getRootPermission()];

            // The user may have multiple groups with different permissions. We must reduce them to a single permission
            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
