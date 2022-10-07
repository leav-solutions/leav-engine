// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARIES_WITH_ATTRIBUTES
// ====================================================

export interface GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list_attributes {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list {
    id: string;
    label: any | null;
    gqlNames: GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list_gqlNames;
    attributes: GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list_attributes[] | null;
}

export interface GET_LIBRARIES_WITH_ATTRIBUTES_libraries {
    totalCount: number;
    list: GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list[];
}

export interface GET_LIBRARIES_WITH_ATTRIBUTES {
    libraries: GET_LIBRARIES_WITH_ATTRIBUTES_libraries | null;
}
