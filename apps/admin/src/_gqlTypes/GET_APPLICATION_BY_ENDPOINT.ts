// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ENDPOINT
// ====================================================

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI {
    id: string;
    library: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI_preview | null;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_icon {
    whoAmI: GET_APPLICATION_BY_ENDPOINT_applications_list_icon_whoAmI;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_libraries {
    id: string;
}

export interface GET_APPLICATION_BY_ENDPOINT_applications_list_trees {
    id: string;
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
    libraries: GET_APPLICATION_BY_ENDPOINT_applications_list_libraries[] | null;
    trees: GET_APPLICATION_BY_ENDPOINT_applications_list_trees[] | null;
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