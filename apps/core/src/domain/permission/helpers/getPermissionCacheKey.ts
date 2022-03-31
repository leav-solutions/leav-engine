// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionsActions, PermissionTypes} from '_types/permissions';
import {PERMISSIONS_CACHE_HEADER} from '../_types';

export default function (
    groupsId: string[],
    permissionType: PermissionTypes,
    applyTo: string,
    permissionAction: PermissionsActions,
    key: string
): string {
    let k = `${PERMISSIONS_CACHE_HEADER}`;

    k += !!groupsId && groupsId?.length ? `:${groupsId.sort().join('+')}` : ':';
    k += !!permissionType ? `:${permissionType}` : ':';
    k += !!applyTo && applyTo !== '' ? `:${applyTo}` : ':';
    k += !!permissionAction ? `:${permissionAction}` : ':';
    k += !!key && key !== '' ? `:${key}` : ':';

    return k;
}
