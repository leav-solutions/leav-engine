// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {type IQueryInfos} from '_types/queryInfos';
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
