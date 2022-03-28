// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions, PermissionTypes} from '_types/permissions';
import {PERMISSIONS_CACHE_HEADER} from './getPermissionCacheKey';

export default function ({
    groupsId,
    permissionType,
    applyTo,
    permissionAction,
    key
}: {
    groupsId?: string[];
    permissionType?: PermissionTypes;
    applyTo?: string;
    permissionAction?: PermissionsActions;
    key?: string;
}): string {
    let k = `${PERMISSIONS_CACHE_HEADER}`;

    if (typeof groupsId !== 'undefined' && groupsId?.length) {
        k = k + `:${groupsId.sort().join('+')}`;
    } else {
        k = k + '*';
    }

    if (typeof permissionType !== 'undefined') {
        k = k + `:${permissionType}`;
    } else {
        k = k + '*';
    }

    if (typeof applyTo !== 'undefined' && applyTo !== '') {
        k = k + `:${applyTo}`;
    } else {
        k = k + '*';
    }

    if (typeof permissionAction !== 'undefined') {
        k = k + `:${permissionAction}`;
    } else {
        k = k + '*';
    }

    if (typeof key !== 'undefined' && key !== '') {
        k = k + `:${key}`;
    } else {
        k = k + '*';
    }

    return k;
}
