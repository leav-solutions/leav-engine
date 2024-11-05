// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult, useQuery} from '@apollo/client';
import {isAllowedQuery} from 'queries/permissions/isAllowedQuery';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {IS_ALLOWED, IS_ALLOWEDVariables} from '_gqlTypes/IS_ALLOWED';

export interface IUseApplicationsPermissionsHook {
    loading: boolean;
    error: QueryResult['error'];
    canDelete: boolean;
    canCreate: boolean;
}

export const useApplicationsPermissions = (): IUseApplicationsPermissionsHook => {
    // Query runs if record is specified (= record edition)
    const {loading, error, data} = useQuery<IS_ALLOWED, IS_ALLOWEDVariables>(isAllowedQuery, {
        variables: {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.admin_create_application, PermissionsActions.admin_delete_application]
        },
        fetchPolicy: 'cache-and-network'
    });

    if (error) {
        return {loading: false, canCreate: false, canDelete: false, error};
    }

    const canCreate = data?.isAllowed?.find(
        permission => permission.name === PermissionsActions.admin_create_application
    ).allowed;

    const canDelete = data?.isAllowed?.find(
        permission => permission.name === PermissionsActions.admin_delete_application
    ).allowed;

    return {
        loading,
        canCreate,
        canDelete,
        error: null
    };
};
