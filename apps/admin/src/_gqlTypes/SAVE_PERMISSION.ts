/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionInput, PermissionTypes, PermissionsActions} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_PERMISSION
// ====================================================

export interface SAVE_PERMISSION_savePermission_actions {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface SAVE_PERMISSION_savePermission_permissionTreeTarget {
    nodeId: string | null;
    tree: string;
}

export interface SAVE_PERMISSION_savePermission {
    type: PermissionTypes;
    applyTo: string | null;
    usersGroup: string | null;
    actions: SAVE_PERMISSION_savePermission_actions[];
    permissionTreeTarget: SAVE_PERMISSION_savePermission_permissionTreeTarget | null;
}

export interface SAVE_PERMISSION {
    savePermission: SAVE_PERMISSION_savePermission;
}

export interface SAVE_PERMISSIONVariables {
    permData: PermissionInput;
}
