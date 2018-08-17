import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import {IPermission, IPermissionsTreeTarget, PermissionsActions, PermissionTypes} from '../../_types/permissions';

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
}

export default function(permissionRepo: IPermissionRepo, config: any = null): IPermissionDomain {
    async function getSimplePermission(
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
    }

    function getDefaultPermission(): boolean {
        const defaultPerm =
            config.permissions && typeof config.permissions.default !== 'undefined' ? config.permissions.default : true;

        return defaultPerm;
    }

    return {
        async savePermission(permData: IPermission, infos: IQueryInfos): Promise<IPermission> {
            // TODO: resolve cyclic dependencies issue (put every permissions domains into this file?)
            // to be able to check permissions here

            // // Does user have the permission to save permissions?
            // const action = AdminPermisisonsActions.EDIT_PERMISSION;
            // const canSavePermission = await adminPermissionDomain.getAdminPermission(action, infos.userId);

            // if (!canSavePermission) {
            //     throw new PermissionError(action);
            // }

            return permissionRepo.savePermission(permData);
        },
        getSimplePermission,
        getDefaultPermission,
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
                        const perm = await this.getSimplePermission(
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
        }
    };
}
