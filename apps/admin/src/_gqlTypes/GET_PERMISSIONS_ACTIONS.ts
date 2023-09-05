// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_PERMISSIONS_ACTIONS
// ====================================================

export interface GET_PERMISSIONS_ACTIONS_permissionsActionsByType {
    name: PermissionsActions;
    label: SystemTranslation | null;
}

export interface GET_PERMISSIONS_ACTIONS {
    permissionsActionsByType: GET_PERMISSIONS_ACTIONS_permissionsActionsByType[];
}

export interface GET_PERMISSIONS_ACTIONSVariables {
    type: PermissionTypes;
    applyOn?: string | null;
}
