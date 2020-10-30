import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetPermissionsByActionsParams} from '../_types';

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
}

export interface IPermissionsByActionsHelper {
    getPermissionsByActions: (params: IGetPermissionsByActionsParams) => Promise<{[name: string]: boolean | null}>;
}

export default function({'core.infra.permission': permissionRepo = null}: IDeps): IPermissionsByActionsHelper {
    return {
        async getPermissionsByActions({
            type,
            applyTo,
            actions,
            usersGroupId,
            permissionTreeTarget,
            ctx
        }: IGetPermissionsByActionsParams): Promise<{[name: string]: boolean | null}> {
            const perms = await permissionRepo.getPermissions({
                type,
                applyTo,
                usersGroupId,
                permissionTreeTarget,
                ctx
            });

            return actions.reduce((actionsPerms, action) => {
                actionsPerms[action] =
                    perms !== null && typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;

                return actionsPerms;
            }, {});
        }
    };
}
