/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsTreeTargetInput, PermissionsActions} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_PERMISSIONS
// ====================================================

export interface GET_PERMISSIONS_perm {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface GET_PERMISSIONS_heritPerm {
    name: PermissionsActions;
    allowed: boolean;
}

export interface GET_PERMISSIONS {
    /**
     * Return saved permissions (no heritage) for given user group
     */
    perm: GET_PERMISSIONS_perm[] | null;
    /**
     * Return herited permissions only for given user group
     */
    heritPerm: GET_PERMISSIONS_heritPerm[] | null;
}

export interface GET_PERMISSIONSVariables {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: string[];
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}
