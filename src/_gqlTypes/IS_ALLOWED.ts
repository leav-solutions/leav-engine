/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionTarget, PermissionsActions} from './globalTypes';

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
    actions: string[];
    target?: PermissionTarget | null;
}
