// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARIES
// ====================================================

export interface GET_LIBRARIES_libraries_list_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIBRARIES_libraries_list {
    id: string;
    system: boolean | null;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    gqlNames: GET_LIBRARIES_libraries_list_gqlNames;
}

export interface GET_LIBRARIES_libraries {
    totalCount: number;
    list: GET_LIBRARIES_libraries_list[];
}

export interface GET_LIBRARIES {
    libraries: GET_LIBRARIES_libraries | null;
}

export interface GET_LIBRARIESVariables {
    id?: string | null;
    label?: string | null;
    system?: boolean | null;
}
