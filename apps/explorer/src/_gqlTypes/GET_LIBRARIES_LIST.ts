// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARIES_LIST
// ====================================================

export interface GET_LIBRARIES_LIST_libraries_list_gqlNames {
    query: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIBRARIES_LIST_libraries_list_permissions {
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface GET_LIBRARIES_LIST_libraries_list {
    id: string;
    label: any | null;
    gqlNames: GET_LIBRARIES_LIST_libraries_list_gqlNames;
    permissions: GET_LIBRARIES_LIST_libraries_list_permissions | null;
}

export interface GET_LIBRARIES_LIST_libraries {
    list: GET_LIBRARIES_LIST_libraries_list[];
}

export interface GET_LIBRARIES_LIST {
    libraries: GET_LIBRARIES_LIST_libraries | null;
}
