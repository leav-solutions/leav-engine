// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, FileType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARIES_LIST
// ====================================================

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: any | null;
    gqlNames: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library_gqlNames;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview_file_library {
    id: string;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview_file_library;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview_file | null;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library;
    preview: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_preview | null;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon {
    id: string;
    whoAmI: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI;
}

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
    behavior: LibraryBehavior;
    icon: GET_LIBRARIES_LIST_libraries_list_icon | null;
    gqlNames: GET_LIBRARIES_LIST_libraries_list_gqlNames;
    permissions: GET_LIBRARIES_LIST_libraries_list_permissions | null;
}

export interface GET_LIBRARIES_LIST_libraries {
    list: GET_LIBRARIES_LIST_libraries_list[];
}

export interface GET_LIBRARIES_LIST {
    libraries: GET_LIBRARIES_LIST_libraries | null;
}
