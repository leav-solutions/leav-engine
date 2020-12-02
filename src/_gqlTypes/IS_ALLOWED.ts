// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions, PermissionTarget} from './globalTypes';

// ====================================================
// GraphQL query operation: IS_ALLOWED
// ====================================================

export interface IS_ALLOWED_isAllowed {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface IS_ALLOWED {
    /**
     * Return permissions (applying heritage) for current user
     */
    isAllowed: IS_ALLOWED_isAllowed[] | null;
}

export interface IS_ALLOWEDVariables {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: PermissionsActions[];
    target?: PermissionTarget | null;
}
