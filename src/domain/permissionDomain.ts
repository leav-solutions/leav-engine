import {IPermission, IPermissionsTreeTarget, PermissionTypes} from '../_types/permissions';
import {IPermissionRepo} from 'infra/permissionRepo';

export interface IPermissionDomain {
    savePermission(permData: IPermission): Promise<IPermission>;
    getSimplePermission(
        type: PermissionTypes,
        action: string,
        usersGroup: string,
        target?: IPermissionsTreeTarget
    ): Promise<boolean | null>;
}

export default function(permissionRepo: IPermissionRepo): IPermissionDomain {
    return {
        async savePermission(permData: IPermission): Promise<IPermission> {
            return permissionRepo.savePermission(permData);
        },
        async getSimplePermission(
            type: PermissionTypes,
            action: string,
            usersGroup: string,
            target: IPermissionsTreeTarget = null
        ): Promise<boolean | null> {
            const perms = await permissionRepo.getPermissions(type, usersGroup, target);

            if (perms === null) {
                return null;
            }

            return typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;
        }
    };
}
