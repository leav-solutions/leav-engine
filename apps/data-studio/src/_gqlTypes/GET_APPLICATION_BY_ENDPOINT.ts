/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ENDPOINT
// ====================================================

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library_gqlNames;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library;
    preview: Preview | null;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon {
    id: string;
    whoAmI: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_permissions {
    access_application: boolean;
    admin_application: boolean;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string | null;
    url: string | null;
    color: string | null;
    icon: GET_APPLICATION_BY_ENDPOINT_applications_list_icon | null;
    module: string | null;
    permissions: GET_APPLICATION_BY_ENDPOINT_applications_list_permissions;
    settings: JSONObject | null;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications {
    list: GET_APPLICATION_BY_ENDPOINT_applications_list[];
}

export interface GET_APPLICATION_BY_ENDPOINT {
    applications: GET_APPLICATION_BY_ENDPOINT_applications | null;
}

export interface GET_APPLICATION_BY_ENDPOINTVariables {
    endpoint: string;
}
