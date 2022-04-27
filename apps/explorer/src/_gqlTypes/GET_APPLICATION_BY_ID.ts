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
    label: any | null;
    description: any | null;
    endpoint: string | null;
    color: string | null;
    icon: string | null;
    libraries: GET_APPLICATION_BY_ID_applications_list_libraries[];
    trees: GET_APPLICATION_BY_ID_applications_list_trees[];
    permissions: GET_APPLICATION_BY_ID_applications_list_permissions | null;
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
