import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetSimplePermissionsParams} from '../_types';
import getPermissionsByActions from './getPermissionsByActions';

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
}

export default async (
    {type, applyTo, action, usersGroupId, permissionTreeTarget = null, ctx}: IGetSimplePermissionsParams,
    deps: IDeps
): Promise<boolean | null> => {
    const perms = await getPermissionsByActions(
        {
            type,
            applyTo,
            actions: [action],
            usersGroupId,
            permissionTreeTarget,
            ctx
        },
        deps
    );

    return perms[action];
};
