// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_APPLICATIONS
// ====================================================

export interface GET_APPLICATIONS_applications_list_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATIONS_applications_list_permissions {
    access_application: boolean;
}

export interface GET_APPLICATIONS_applications_list {
    id: string;
    label: SystemTranslation;
    description: SystemTranslation | null;
    endpoint: string;
    url: string;
    color: string | null;
    libraries: GET_APPLICATIONS_applications_list_libraries[];
    permissions: GET_APPLICATIONS_applications_list_permissions;
}

export interface GET_APPLICATIONS_applications {
    list: GET_APPLICATIONS_applications_list[];
}

export interface GET_APPLICATIONS {
    applications: GET_APPLICATIONS_applications | null;
}
