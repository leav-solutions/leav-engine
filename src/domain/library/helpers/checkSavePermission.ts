// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {IQueryInfos} from '_types/queryInfos';
import {AppPermissionsActions} from '../../../_types/permissions';

export default async (
    existingLib: boolean,
    userId: string,
    deps: {appPermissionDomain: IAppPermissionDomain},
    ctx: IQueryInfos
): Promise<{canSave: boolean; action: AppPermissionsActions}> => {
    const action = existingLib ? AppPermissionsActions.EDIT_LIBRARY : AppPermissionsActions.CREATE_LIBRARY;
    const canSaveLibrary = await deps.appPermissionDomain.getAppPermission({action, userId, ctx});
    if (!canSaveLibrary) {
        return {canSave: false, action};
    }

    return {canSave: true, action};
};
