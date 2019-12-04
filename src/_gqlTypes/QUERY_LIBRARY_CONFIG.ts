/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: QUERY_LIBRARY_CONFIG
// ====================================================

export interface QUERY_LIBRARY_CONFIG_libraries_list_gqlNames {
    query: string;
    filter: string;
}

export interface QUERY_LIBRARY_CONFIG_libraries_list_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
}

export interface QUERY_LIBRARY_CONFIG_libraries_list {
    id: string;
    label: any | null;
    gqlNames: QUERY_LIBRARY_CONFIG_libraries_list_gqlNames;
    attributes: QUERY_LIBRARY_CONFIG_libraries_list_attributes[] | null;
}

export interface QUERY_LIBRARY_CONFIG_libraries {
    list: QUERY_LIBRARY_CONFIG_libraries_list[];
}

export interface QUERY_LIBRARY_CONFIG {
    libraries: QUERY_LIBRARY_CONFIG_libraries | null;
}

export interface QUERY_LIBRARY_CONFIGVariables {
    id?: string | null;
    lang?: AvailableLanguage[] | null;
}
