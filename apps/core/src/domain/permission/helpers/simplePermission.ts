// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetSimplePermissionsParams} from '../_types';
import {IPermissionsByActionsHelper} from './permissionsByActions';

interface IDeps {
    'core.domain.permission.helpers.permissionsByActions': IPermissionsByActionsHelper;
}

export interface ISimplePermissionHelper {
    getSimplePermission: (params: IGetSimplePermissionsParams) => Promise<boolean | null>;
}

export default function ({
    'core.domain.permission.helpers.permissionsByActions': permsByActionsHelper
}: IDeps): ISimplePermissionHelper {
    return {
        async getSimplePermission({type, applyTo, action, usersGroupNodeId, permissionTreeTarget = null, ctx}) {
            const perms = await permsByActionsHelper.getPermissionsByActions({
                type,
                applyTo,
                actions: [action],
                usersGroupNodeId,
                permissionTreeTarget,
                ctx
            });

            return perms[action] ?? null;
        }
    };
}
