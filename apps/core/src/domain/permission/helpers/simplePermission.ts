import {type IGetSimplePermissionsParams} from '../_types';
import {type IPermissionsByActionsHelper} from './permissionsByActions';

interface IDeps {
    'core.domain.permission.helpers.permissionsByActions': IPermissionsByActionsHelper;
}

export interface ISimplePermissionHelper {
    getSimplePermission: (params: IGetSimplePermissionsParams) => Promise<boolean | null>;
}

export default function ({
    'core.domain.permission.helpers.permissionsByActions': permsByActionsHelper,
}: IDeps): ISimplePermissionHelper {
    return {
        async getSimplePermission({
            type,
            applyTo,
            action,
            usersGroupNodeId,
            permissionTreeTarget = null,
            dependenciesTreeTargets = null,
            ctx,
        }) {
            const perms = await permsByActionsHelper.getPermissionsByActions({
                type,
                applyTo,
                actions: [action],
                usersGroupNodeId,
                permissionTreeTarget,
                dependenciesTreeTargets,
                ctx,
            });

            return perms[action] ?? null;
        },
    };
}
