import {PermissionsActions, useIsAllowedQuery} from '../_gqlTypes';

export const extractPermissionFromQuery = (
    queryResult: ReturnType<typeof useIsAllowedQuery>,
    action: PermissionsActions,
    fallbackPermission: boolean = false
): boolean => {
    return !queryResult.loading && !queryResult.error
        ? queryResult.data?.isAllowed?.find(permission => permission.name === action)?.allowed ?? fallbackPermission
        : fallbackPermission;
};
