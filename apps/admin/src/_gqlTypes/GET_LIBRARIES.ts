// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
    label: SystemTranslation | null;
}

export interface GET_LIBRARIES_libraries_list_icon_whoAmI {
    id: string;
    library: GET_LIBRARIES_libraries_list_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface GET_LIBRARIES_libraries_list_icon {
    whoAmI: GET_LIBRARIES_libraries_list_icon_whoAmI;
}

export interface GET_LIBRARIES_libraries_list {
    id: string;
    system: boolean | null;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    icon: GET_LIBRARIES_libraries_list_icon | null;
}

export interface GET_LIBRARIES_libraries {
    totalCount: number;
    list: GET_LIBRARIES_libraries_list[];
}

export interface GET_LIBRARIES {
    libraries: GET_LIBRARIES_libraries | null;
}

export interface GET_LIBRARIESVariables {
    id?: string[] | null;
    label?: string[] | null;
    system?: boolean | null;
    behavior?: LibraryBehavior[] | null;
}
