import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {AdminPermissionsActions} from '../../../_types/permissions';
import {IQueryInfos} from '_types/queryInfos';

export default async (
    existingLib: boolean,
    userId: number,
    deps: {permissionDomain: IPermissionDomain},
    ctx: IQueryInfos
): Promise<{canSave: boolean; action: AdminPermissionsActions}> => {
    const action = existingLib ? AdminPermissionsActions.EDIT_LIBRARY : AdminPermissionsActions.CREATE_LIBRARY;
    const canSaveLibrary = await deps.permissionDomain.getAdminPermission({action, userId, ctx});
    if (!canSaveLibrary) {
        return {canSave: false, action};
    }

    return {canSave: true, action};
};
