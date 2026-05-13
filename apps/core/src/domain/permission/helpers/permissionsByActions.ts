import {type IPermissionRepo} from '../../../infra/permission/permissionRepo';
import {type IGetPermissionsByActionsParams} from '../_types';

interface IDeps {
    'core.infra.permission': IPermissionRepo;
}

export interface IPermissionsByActionsHelper {
    getPermissionsByActions: (params: IGetPermissionsByActionsParams) => Promise<{[name: string]: boolean | null}>;
}

export default function ({'core.infra.permission': permissionRepo}: IDeps): IPermissionsByActionsHelper {
    return {
        async getPermissionsByActions({
            type,
            applyTo,
            actions,
            usersGroupNodeId,
            permissionTreeTarget,
            dependenciesTreeTargets = null,
            ctx,
        }: IGetPermissionsByActionsParams): Promise<{[name: string]: boolean | null}> {
            const perms = await permissionRepo.getPermissions({
                type,
                applyTo,
                usersGroupNodeId,
                permissionTreeTarget,
                dependenciesTreeTargets,
                ctx,
            });

            return actions.reduce((actionsPerms, action) => {
                actionsPerms[action] = perms?.actions?.[action] ?? null;

                return actionsPerms;
            }, {});
        },
    };
}
