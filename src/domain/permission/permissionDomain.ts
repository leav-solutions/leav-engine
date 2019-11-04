import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import PermissionError from '../../errors/PermissionError';
import {
    AdminPermissionsActions,
    IPermission,
    IPermissionsTreeTarget,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes
} from '../../_types/permissions';

export interface IPermissionDomain {
    savePermission(permData: IPermission, infos: IQueryInfos): Promise<IPermission>;

    /**
     * Retrieve exact permission for given params. No heritage here, just saved permission or null if nothing found
     *
     * @param type
     * @param applyTo
     * @param action
     * @param usersGroupId
     * @param permissionTreeTarget
     */
    getSimplePermission(
        type: PermissionTypes,
        applyTo: string | null,
        action: PermissionsActions,
        usersGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean | null>;

    /**
     * Retrieve exact permission for given params and actions. No heritage here, just saved permission for each action
     *
     * @param type
     * @param applyTo
     * @param actions
     * @param usersGroupId
     * @param permissionTreeTarget
     */
    getPermissionsByActions(
        type: PermissionTypes,
        applyTo: string | null,
        actions: PermissionsActions[],
        usersGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<{[name: string]: boolean | null} | null>;

    getPermissionByUserGroups(
        type: PermissionTypes,
        action: PermissionsActions,
        userGroupsPaths: ITreeNode[][],
        applyTo?: string,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean | null>;
    getDefaultPermission(): boolean;
    getAdminPermission(action: AdminPermissionsActions, userId: number): Promise<boolean>;
    getHeritedAdminPermission(action: AdminPermissionsActions, userGroupId: number): Promise<boolean>;
    getLibraryPermission(action: LibraryPermissionsActions, libraryId: string, userId: number): Promise<boolean>;
    getHeritedLibraryPermission(
        action: LibraryPermissionsActions,
        libraryId: string,
        userGroupId: number
    ): Promise<boolean>;
}

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.tree'?: ITreeRepo;
    config?: any;
}

export default function({
    'core.infra.permission': permissionRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.infra.tree': treeRepo = null,
    config = null
}: IDeps = {}): IPermissionDomain {
    const ret = {
        async savePermission(permData: IPermission, infos: IQueryInfos): Promise<IPermission> {
            // Does user have the permission to save permissions?
            const action = AdminPermissionsActions.EDIT_PERMISSION;
            const canSavePermission = await ret.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            return permissionRepo.savePermission(permData);
        },
        async getSimplePermission(
            type: PermissionTypes,
            applyTo: string,
            action: PermissionsActions,
            usersGroupId: number,
            permissionTreeTarget: IPermissionsTreeTarget = null
        ): Promise<boolean | null> {
            const perms = await ret.getPermissionsByActions(
                type,
                applyTo,
                [action],
                usersGroupId,
                permissionTreeTarget
            );

            return perms[action];
        },
        async getPermissionsByActions(
            type: PermissionTypes,
            applyTo: string,
            actions: PermissionsActions[],
            usersGroupId: number,
            permissionTreeTarget: IPermissionsTreeTarget = null
        ): Promise<{[name: string]: boolean | null}> {
            const perms = await permissionRepo.getPermissions(type, applyTo, usersGroupId, permissionTreeTarget);

            return actions.reduce((actionsPerms, action) => {
                actionsPerms[action] =
                    perms !== null && typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;

                return actionsPerms;
            }, {});
        },
        getDefaultPermission(): boolean {
            const defaultPerm =
                config.permissions && typeof config.permissions.default !== 'undefined'
                    ? config.permissions.default
                    : true;

            return defaultPerm;
        },
        async getPermissionByUserGroups(
            type: PermissionTypes,
            action: PermissionsActions,
            userGroupsPaths: ITreeNode[][],
            applyTo: string = null,
            permissionTreeTarget: IPermissionsTreeTarget = null
        ): Promise<boolean | null> {
            const _getRootPermission = () => ret.getSimplePermission(type, applyTo, action, null, permissionTreeTarget);

            // Retrieve permission for each user group.
            // If user has no group, retrieve permission for root level ("all users")
            const userPerms = userGroupsPaths.length
                ? await Promise.all(
                      userGroupsPaths.map(async groupPath => {
                          for (const group of groupPath.slice().reverse()) {
                              const perm = await ret.getSimplePermission(
                                  type,
                                  applyTo,
                                  action,
                                  group.record.id,
                                  permissionTreeTarget
                              );

                              if (perm !== null) {
                                  return perm;
                              }
                          }

                          // Nothing found in tree, check on root level
                          const rootPerm = await _getRootPermission();

                          return rootPerm;
                      })
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
        },
        async getAdminPermission(action: AdminPermissionsActions, userId: number): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({
                filters: {id: 'user_groups'},
                strictFilters: true
            });

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userId, userGroupAttr.list[0]);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const perm = await ret.getPermissionByUserGroups(PermissionTypes.ADMIN, action, userGroupsPaths);

            return perm !== null ? perm : ret.getDefaultPermission();
        },
        async getHeritedAdminPermission(action: AdminPermissionsActions, userGroupId: number): Promise<boolean> {
            // Get perm for user group's parent
            const groupAncestors = await treeRepo.getElementAncestors('users_groups', {
                id: userGroupId,
                library: 'users_groups'
            });

            const perm = await ret.getPermissionByUserGroups(
                PermissionTypes.ADMIN,
                action,
                [groupAncestors.slice(0, -1)] // Start from parent group
            );

            return perm !== null ? perm : ret.getDefaultPermission();
        },
        async getLibraryPermission(
            action: LibraryPermissionsActions,
            libraryId: string,
            userId: number
        ): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({
                filters: {id: 'user_groups'},
                strictFilters: true
            });

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userId, userGroupAttr.list[0]);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const perm = await ret.getPermissionByUserGroups(
                PermissionTypes.LIBRARY,
                action,
                userGroupsPaths,
                libraryId
            );

            return perm !== null ? perm : ret.getDefaultPermission();
        },
        async getHeritedLibraryPermission(
            action: LibraryPermissionsActions,
            libraryId: string,
            userGroupId: number
        ): Promise<boolean> {
            // Get perm for user group's parent
            const includeTreeRoot = true;
            const groupAncestors = await treeRepo.getElementAncestors('users_groups', {
                id: userGroupId,
                library: 'users_groups'
            });

            const perm = await ret.getPermissionByUserGroups(
                PermissionTypes.LIBRARY,
                action,
                [groupAncestors.slice(0, -1)], // Start from parent group
                libraryId
            );

            return perm !== null ? perm : ret.getDefaultPermission();
        }
    };

    return ret;
}
