// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetPermissionByUserGroupsParams} from '../_types';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {ISimplePermissionHelper} from './simplePermission';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {ITreeNode} from '../../../_types/tree';

interface IDeps {
    'core.domain.permission.helpers.simplePermission': ISimplePermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.permission'?: IPermissionRepo;
}

export interface IPermissionByUserGroupsHelper {
    getPermissionByUserGroups: (params: IGetPermissionByUserGroupsParams) => Promise<boolean | null>;
}

export default function (deps: IDeps): IPermissionByUserGroupsHelper {
    const {
        'core.domain.permission.helpers.simplePermission': simplePermHelper,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper
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
            const _getRootPermission = (treeTarget) =>
                simplePermHelper.getSimplePermission({
                    type,
                    applyTo,
                    action,
                    usersGroupNodeId: null,
                    permissionTreeTarget: treeTarget,
                    ctx
                });

            let permTreePath: ITreeNode[] = null;
            if (permissionTreeTarget) {
                permTreePath = (await elementAncestorsHelper.getCachedElementAncestors({
                    // Ancestors of value
                    treeId: permissionTreeTarget.tree,
                    nodeId: permissionTreeTarget.nodeId,
                    ctx
                })).reverse();
            }

            // Retrieve permission for each user group.
            // If user has no group, retrieve permission for root level ("all users")
            const userPerms = userGroupsPaths.length
                ? await Promise.all(
                      userGroupsPaths.map(async (userGroupPath): Promise<boolean | null> => {
                          let userGroupPermission: boolean | null = null;

                          const checkPermission = async (treeTargetPath: ITreeNode[] | null) => {
                              if (userGroupPath.length) {
                                  for (const groupNode of userGroupPath) {

                                      // Check if this group node has a permission defined on it
                                      const groupNodePermission = await simplePermHelper.getSimplePermission({
                                          type,
                                          applyTo,
                                          action,
                                          usersGroupNodeId: groupNode.id,
                                          ...(!!treeTargetPath && {permissionTreeTarget: {tree: permissionTreeTarget.tree, nodeId: treeTargetPath[0]?.id ?? null}}),
                                          ctx
                                      });


                                      // We stop on the first group node with a permission defined (null == inherited)
                                      if (groupNodePermission !== null) {
                                          userGroupPermission = groupNodePermission;
                                          break;
                                      }
                                  }
                              }

                              if (userGroupPermission === null) {
                                  if (treeTargetPath?.length) {
                                      return checkPermission(treeTargetPath.slice(1));
                                  } else if (!!treeTargetPath && !treeTargetPath.length) {
                                      userGroupPermission = await _getRootPermission({tree: permissionTreeTarget.tree, nodeId: null}); //?? defaultPermHelper.getDefaultPermission(); ?
                                  } else {
                                      userGroupPermission = await _getRootPermission(permissionTreeTarget) ?? defaultPermHelper.getDefaultPermission();
                                  }
                              }

                              return userGroupPermission;
                          };

                          // if (userGroupPath.length) {
                              await checkPermission(permTreePath);
                          // }

                          // If no permission was found on any group, retrieve permission for root level ("all users")
                          // if (userGroupPermission === null) {
                          //     userGroupPermission = await _getRootPermission();
                          // }

                          return userGroupPermission;
                      })
                  )
                : [await _getRootPermission(permissionTreeTarget) ?? defaultPermHelper.getDefaultPermission()]; // TODO: à vérifier l'ajout du ??

            // The user may have multiple groups with different permissions. We must reduce them to a single permission
            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
