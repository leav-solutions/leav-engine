import {type IAdminPermissionDomain} from '../../permission/adminPermissionDomain';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AdminPermissionsActions} from '../../../_types/permissions';

export default async (
    existingLib: boolean,
    deps: {adminPermissionDomain: IAdminPermissionDomain},
    ctx: IQueryInfos,
): Promise<{canSave: boolean; action: AdminPermissionsActions}> => {
    const action = existingLib ? AdminPermissionsActions.EDIT_LIBRARY : AdminPermissionsActions.CREATE_LIBRARY;
    const canSaveLibrary = await deps.adminPermissionDomain.getAdminPermission({action, ctx});
    if (!canSaveLibrary) {
        return {canSave: false, action};
    }

    return {canSave: true, action};
};
