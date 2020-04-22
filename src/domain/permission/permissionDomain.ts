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
    savePermission(permData: IPermission, ctx: IQueryInfos): Promise<IPermission>;

    /**
     * Retrieve exact permission for given params. No heritage here, just saved permission or null if nothing found
     */
    getSimplePermission({
        type,
        applyTo,
        action,
        usersGroupId,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        applyTo: string | null;
        action: PermissionsActions;
        usersGroupId: number;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<boolean | null>;

    /**
     * Retrieve exact permission for given params and actions. No heritage here, just saved permission for each action
     */
    getPermissionsByActions({
        type,
        applyTo,
        actions,
        usersGroupId,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        applyTo: string | null;
        actions: PermissionsActions[];
        usersGroupId: number;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<{[name: string]: boolean | null} | null>;

    getPermissionByUserGroups({
        type,
        action,
        userGroupsPaths,
        applyTo,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        action: PermissionsActions;
        userGroupsPaths: ITreeNode[][];
        applyTo?: string;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<boolean | null>;

    getDefaultPermission(ctx): boolean;

    getAdminPermission({
        action,
        userId,
        ctx
    }: {
        action: AdminPermissionsActions;
        userId: number;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    getHeritedAdminPermission({
        action,
        userGroupId,
        ctx
    }: {
        action: AdminPermissionsActions;
        userGroupId: number;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    getLibraryPermission({
        action,
        libraryId,
        userId,
        ctx
    }: {
        action: LibraryPermissionsActions;
        libraryId: string;
        userId: number;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    getHeritedLibraryPermission({
        action,
        libraryId,
        userGroupId,
        ctx
    }: {
        action: LibraryPermissionsActions;
        libraryId: string;
        userGroupId: number;
        ctx: IQueryInfos;
    }): Promise<boolean>;
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
    const ret: IPermissionDomain = {
        async savePermission(permData: IPermission, ctx: IQueryInfos): Promise<IPermission> {
            // Does user have the permission to save permissions?
            const action = AdminPermissionsActions.EDIT_PERMISSION;
            const canSavePermission = await ret.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            return permissionRepo.savePermission({permData, ctx});
        },
        async getSimplePermission({
            type,
            applyTo,
            action,
            usersGroupId,
            permissionTreeTarget = null,
            ctx
        }): Promise<boolean | null> {
            const perms = await ret.getPermissionsByActions({
                type,
                applyTo,
                actions: [action],
                usersGroupId,
                permissionTreeTarget,
                ctx
            });

            return perms[action];
        },
        async getPermissionsByActions({
            type,
            applyTo,
            actions,
            usersGroupId,
            permissionTreeTarget,
            ctx
        }): Promise<{[name: string]: boolean | null}> {
            const perms = await permissionRepo.getPermissions({type, applyTo, usersGroupId, permissionTreeTarget, ctx});

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
        async getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo = null,
            permissionTreeTarget = null,
            ctx
        }): Promise<boolean | null> {
            const _getRootPermission = () =>
                ret.getSimplePermission({
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
                      userGroupsPaths.map(async groupPath => {
                          for (const group of groupPath.slice().reverse()) {
                              const perm = await ret.getSimplePermission({
                                  type,
                                  applyTo,
                                  action,
                                  usersGroupId: group.record.id,
                                  permissionTreeTarget,
                                  ctx
                              });

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
        async getAdminPermission({action, userId, ctx}): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({
                params: {
                    filters: {id: 'user_groups'},
                    strictFilters: true
                },
                ctx
            });

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues({
                library: 'users',
                recordId: userId,
                attribute: userGroupAttr.list[0],
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

            const perm = await ret.getPermissionByUserGroups({
                type: PermissionTypes.ADMIN,
                action,
                userGroupsPaths,
                ctx
            });

            return perm !== null ? perm : ret.getDefaultPermission(ctx);
        },
        async getHeritedAdminPermission({action, userGroupId, ctx}): Promise<boolean> {
            // Get perm for user group's parent
            const groupAncestors = await treeRepo.getElementAncestors({
                treeId: 'users_groups',
                element: {
                    id: userGroupId,
                    library: 'users_groups'
                },
                ctx
            });

            const perm = await ret.getPermissionByUserGroups({
                type: PermissionTypes.ADMIN,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                ctx
            });

            return perm !== null ? perm : ret.getDefaultPermission(ctx);
        },
        async getLibraryPermission({action, libraryId, userId, ctx}): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({
                params: {
                    filters: {id: 'user_groups'},
                    strictFilters: true
                },
                ctx
            });

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues({
                library: 'users',
                recordId: userId,
                attribute: userGroupAttr.list[0],
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

            const perm = await ret.getPermissionByUserGroups({
                type: PermissionTypes.LIBRARY,
                action,
                userGroupsPaths,
                applyTo: libraryId,
                ctx
            });

            return perm !== null ? perm : ret.getDefaultPermission(ctx);
        },
        async getHeritedLibraryPermission({action, libraryId, userGroupId, ctx}): Promise<boolean> {
            // Get perm for user group's parent
            const includeTreeRoot = true;
            const groupAncestors = await treeRepo.getElementAncestors({
                treeId: 'users_groups',
                element: {
                    id: userGroupId,
                    library: 'users_groups'
                },
                ctx
            });

            const perm = await ret.getPermissionByUserGroups({
                type: PermissionTypes.LIBRARY,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo: libraryId,
                ctx
            });

            return perm !== null ? perm : ret.getDefaultPermission(ctx);
        }
    };

    return ret;
}
