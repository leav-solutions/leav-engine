// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
