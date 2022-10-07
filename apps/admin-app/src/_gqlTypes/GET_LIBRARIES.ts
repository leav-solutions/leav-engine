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

export interface GET_LIBRARIES_libraries_list_icon_whoAmI_library {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_LIBRARIES_libraries_list_icon_whoAmI {
    id: string;
    library: GET_LIBRARIES_libraries_list_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_LIBRARIES_libraries_list_icon_whoAmI_preview | null;
}

export interface GET_LIBRARIES_libraries_list_icon {
    whoAmI: GET_LIBRARIES_libraries_list_icon_whoAmI;
}

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
    label: any | null;
    behavior: LibraryBehavior;
    icon: GET_LIBRARIES_libraries_list_icon | null;
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
    behavior?: LibraryBehavior[] | null;
}
