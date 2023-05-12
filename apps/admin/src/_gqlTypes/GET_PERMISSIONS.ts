// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions, PermissionsTreeTargetInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_PERMISSIONS
// ====================================================

export interface GET_PERMISSIONS_perm {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface GET_PERMISSIONS_inheritPerm {
    name: PermissionsActions;
    allowed: boolean;
}

export interface GET_PERMISSIONS {
    /**
     * Return saved permissions (no heritage) for given user group
     */
    perm: GET_PERMISSIONS_perm[] | null;
    /**
     * Return inherited permissions only for given user group
     */
    inheritPerm: GET_PERMISSIONS_inheritPerm[] | null;
}

export interface GET_PERMISSIONSVariables {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: PermissionsActions[];
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}
