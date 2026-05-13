import {type PermissionsActions, type PermissionTypes} from '../../../_types/permissions';
import {PERMISSIONS_CACHE_HEADER} from '../_types';

export default function ({
    groupsId,
    permissionType,
    applyTo,
    permissionAction,
    key,
}: {
    groupsId?: string[];
    permissionType?: PermissionTypes;
    applyTo?: string;
    permissionAction?: PermissionsActions;
    key?: string;
}): string {
    let k = `${PERMISSIONS_CACHE_HEADER}`;

    k += !!groupsId && groupsId?.length ? `:${groupsId.sort().join('+')}` : ':*';
    k += !!permissionType ? `:${permissionType}` : ':*';
    k += !!applyTo && applyTo !== '' ? `:${applyTo}` : ':*';
    k += !!permissionAction ? `:${permissionAction}` : ':*';
    k += !!key && key !== '' ? `:${key}` : ':*';

    return k;
}
