// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
            usersGroupNodeId,
            permissionTreeTarget,
            ctx
        }: IGetPermissionsByActionsParams): Promise<{[name: string]: boolean | null}> {
            const perms = await permissionRepo.getPermissions({
                type,
                applyTo,
                usersGroupNodeId,
                permissionTreeTarget,
                ctx
            });

            return actions.reduce((actionsPerms, action) => {
                actionsPerms[action] = perms?.actions?.[action] ?? null;

                return actionsPerms;
            }, {});
        }
    };
}
