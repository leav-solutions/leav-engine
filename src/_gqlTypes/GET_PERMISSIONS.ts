/* tslint:disable */
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions, PermissionsTreeTargetInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_PERMISSIONS
// ====================================================

export interface GET_PERMISSIONS_permissions {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface GET_PERMISSIONS {
    permissions: GET_PERMISSIONS_permissions[] | null;
}

export interface GET_PERMISSIONSVariables {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: PermissionsActions[];
    usersGroup: string;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}
