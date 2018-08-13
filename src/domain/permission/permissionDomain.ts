import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IPermission, IPermissionsTreeTarget, PermissionsActions, PermissionTypes} from '../../_types/permissions';

export interface IPermissionDomain {
    savePermission(permData: IPermission): Promise<IPermission>;
    getSimplePermission(
        type: PermissionTypes,
        applyTo: string,
        action: PermissionsActions,
        usersGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean | null>;
    getDefaultPermission(): boolean;
}

export default function(permissionRepo: IPermissionRepo, config: any = null): IPermissionDomain {
    return {
        async savePermission(permData: IPermission): Promise<IPermission> {
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
        }
    };
}
