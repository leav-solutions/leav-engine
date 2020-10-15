import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetPermissionByUserGroupsParams} from '../_types';
import getSimplePermission from './getSimplePermission';

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
}

export default async (
    {type, action, userGroupsPaths, applyTo = null, permissionTreeTarget = null, ctx}: IGetPermissionByUserGroupsParams,
    deps: IDeps
): Promise<boolean | null> => {
    const _getRootPermission = () =>
        getSimplePermission(
            {
                type,
                applyTo,
                action,
                usersGroupId: null,
                permissionTreeTarget,
                ctx
            },
            deps
        );

    // Retrieve permission for each user group.
    // If user has no group, retrieve permission for root level ("all users")
    const userPerms = userGroupsPaths.length
        ? await Promise.all(
              userGroupsPaths.map(
                  async (groupPath): Promise<boolean> => {
                      for (const group of groupPath.slice().reverse()) {
                          const perm = await getSimplePermission(
                              {
                                  type,
                                  applyTo,
                                  action,
                                  usersGroupId: group.record.id,
                                  permissionTreeTarget,
                                  ctx
                              },
                              deps
                          );

                          if (perm !== null) {
                              return perm;
                          }
                      }

                      // Nothing found in tree, check on root level
                      const rootPerm = await _getRootPermission();

                      return rootPerm;
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
    const userPerm = userPerms.reduce((globalPerm, groupPerm) => {
        if (globalPerm || groupPerm) {
            return true;
        } else if (globalPerm === groupPerm || (globalPerm === null && !groupPerm)) {
            return groupPerm;
        } else {
            return globalPerm;
        }
    }, null);

    return userPerm;
};
