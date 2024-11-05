// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
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
    label: SystemTranslation | null;
}

export interface QUERY_LIBRARY_CONFIG_libraries_list {
    id: string;
    label: SystemTranslation | null;
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
    id?: string[] | null;
    lang?: AvailableLanguage[] | null;
}
