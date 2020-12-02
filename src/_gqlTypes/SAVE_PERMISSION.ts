// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    id: string | null;
    tree: string;
    library: string | null;
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
