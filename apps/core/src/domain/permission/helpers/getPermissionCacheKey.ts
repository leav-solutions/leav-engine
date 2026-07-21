import {type PermissionsActions, type PermissionTypes} from '../../../_types/permissions';
import {PERMISSIONS_CACHE_HEADER} from '../_types';

export default function (
    groupsId?: string[] | null,
    permissionType?: PermissionTypes | null,
    applyTo?: string | null,
    permissionAction?: PermissionsActions | null,
    key?: string | null,
): string {
    let k = `${PERMISSIONS_CACHE_HEADER}`;

    k += !!groupsId && groupsId?.length ? `:${groupsId.sort().join('+')}` : ':';
    k += permissionType ? `:${permissionType}` : ':';
    k += !!applyTo && applyTo !== '' ? `:${applyTo}` : ':';
    k += permissionAction ? `:${permissionAction}` : ':';
    k += !!key && key !== '' ? `:${key}` : ':';

    return k;
}
