import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import {
    IPermission,
    IPermissionsTreeTarget,
    PermissionsActions,
    PermissionTypes,
    AdminPermisisonsActions
} from '../../_types/permissions';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import PermissionError from '../../errors/PermissionError';

export interface IPermissionDomain {
    savePermission(permData: IPermission, infos: IQueryInfos): Promise<IPermission>;
    getSimplePermission(
        type: PermissionTypes,
        applyTo: string | null,
        action: PermissionsActions,
        usersGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean | null>;
    getPermissionByUserGroups(
        type: PermissionTypes,
        action: PermissionsActions,
        userGroupsPaths: ITreeNode[][],
        applyTo?: string,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean | null>;
    getDefaultPermission(): boolean;
    getAdminPermission(action: AdminPermisisonsActions, userGroupId: number): Promise<boolean>;
}

export default function(
    permissionRepo: IPermissionRepo = null,
    attributeRepo: IAttributeRepo = null,
    valueRepo: IValueRepo = null,
    treeRepo: ITreeRepo = null,
    config: any = null
): IPermissionDomain {
    const ret = {
        async savePermission(permData: IPermission, infos: IQueryInfos): Promise<IPermission> {
            // Does user have the permission to save permissions?
            const action = AdminPermisisonsActions.EDIT_PERMISSION;
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
            const perms = await permissionRepo.getPermissions(type, applyTo, usersGroupId, permissionTreeTarget);

            if (perms === null) {
                return null;
            }

            return typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;
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
            const userPerms = await Promise.all(
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

                    return null;
                })
            );

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
        async getAdminPermission(action: AdminPermisisonsActions, userGroupId: number): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({id: 'user_groups'});

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userGroupId, userGroupAttr[0]);
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
        }
    };

    return ret;
}
