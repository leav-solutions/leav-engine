import {IGetSimplePermissionsParams} from '../_types';
import {IPermissionsByActionsHelper} from './permissionsByActions';

interface IDeps {
    'core.domain.permission.helpers.permissionsByActions'?: IPermissionsByActionsHelper;
}

export interface ISimplePermissionHelper {
    getSimplePermission: (params: IGetSimplePermissionsParams) => Promise<boolean | null>;
}

export default function({
    'core.domain.permission.helpers.permissionsByActions': permsByActionsHelper = null
}: IDeps): ISimplePermissionHelper {
    return {
        async getSimplePermission({
            type,
            applyTo,
            action,
            usersGroupId,
            permissionTreeTarget = null,
            ctx
        }: IGetSimplePermissionsParams): Promise<boolean | null> {
            const perms = await permsByActionsHelper.getPermissionsByActions({
                type,
                applyTo,
                actions: [action],
                usersGroupId,
                permissionTreeTarget,
                ctx
            });

            return perms[action];
        }
    };
}
