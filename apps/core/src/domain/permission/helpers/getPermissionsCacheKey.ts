// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions, PermissionTypes} from '_types/permissions';

export const PERMISSIONS_CACHE_HEADER = 'permissions';

export default function (
    groupsId: string[],
    permissionType: PermissionTypes,
    applyTo: string,
    permissionAction: PermissionsActions,
    key: string
): string {
    let k = `${PERMISSIONS_CACHE_HEADER}`;

    if (typeof groupsId !== 'undefined' && groupsId?.length) {
        k = k + `:${groupsId.sort().join('+')}`;
    }

    if (typeof permissionType !== 'undefined') {
        k = k + `:${permissionType}`;
    }

    if (typeof applyTo !== 'undefined' && applyTo !== '') {
        k = k + `:${applyTo}`;
    }

    if (typeof permissionAction !== 'undefined') {
        k = k + `:${permissionAction}`;
    }

    if (typeof key !== 'undefined' && key !== '') {
        k = k + `:${key}`;
    }

    return k;
}
