// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ID
// ====================================================

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library_gqlNames;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview_file_library {
    id: string;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview_file {
    id: string;
    library: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview_file_library;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
    original: string;
    file: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview_file | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library;
    preview: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon {
    id: string;
    whoAmI: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI;
}

export interface GET_APPLICATION_BY_ID_applications_list_libraries {
    id: string;
}

export interface GET_APPLICATION_BY_ID_applications_list_trees {
    id: string;
}

export interface GET_APPLICATION_BY_ID_applications_list_permissions {
    access_application: boolean;
}

export interface GET_APPLICATION_BY_ID_applications_list {
    id: string;
    label: any;
    description: any | null;
    endpoint: string;
    url: string;
    color: string | null;
    icon: GET_APPLICATION_BY_ID_applications_list_icon | null;
    libraries: GET_APPLICATION_BY_ID_applications_list_libraries[];
    trees: GET_APPLICATION_BY_ID_applications_list_trees[];
    permissions: GET_APPLICATION_BY_ID_applications_list_permissions;
}

export interface GET_APPLICATION_BY_ID_applications {
    list: GET_APPLICATION_BY_ID_applications_list[];
}

export interface GET_APPLICATION_BY_ID {
    applications: GET_APPLICATION_BY_ID_applications | null;
}

export interface GET_APPLICATION_BY_IDVariables {
    id: string;
}
