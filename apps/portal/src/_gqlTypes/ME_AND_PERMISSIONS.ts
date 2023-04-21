/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions} from './globalTypes';

// ====================================================
// GraphQL query operation: ME_AND_PERMISSIONS
// ====================================================

export interface ME_AND_PERMISSIONS_me_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ME_AND_PERMISSIONS_me_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
}

export interface ME_AND_PERMISSIONS_me_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ME_AND_PERMISSIONS_me_whoAmI_library;
    preview: ME_AND_PERMISSIONS_me_whoAmI_preview | null;
}

export interface ME_AND_PERMISSIONS_me {
    login: string | null;
    id: string;
    whoAmI: ME_AND_PERMISSIONS_me_whoAmI;
}

export interface ME_AND_PERMISSIONS_permissions {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface ME_AND_PERMISSIONS {
    me: ME_AND_PERMISSIONS_me | null;
    /**
     * Return permissions (applying heritage) for current user
     */
    permissions: ME_AND_PERMISSIONS_permissions[] | null;
}

export interface ME_AND_PERMISSIONSVariables {
    type: PermissionTypes;
    actions: PermissionsActions[];
}
