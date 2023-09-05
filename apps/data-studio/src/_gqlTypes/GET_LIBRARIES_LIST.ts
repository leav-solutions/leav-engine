/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibrariesFiltersInput, LibraryBehavior} from './globalTypes';

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
    label: SystemTranslation | null;
    gqlNames: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library_gqlNames;
}

export interface GET_LIBRARIES_LIST_libraries_list_icon_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: GET_LIBRARIES_LIST_libraries_list_icon_whoAmI_library;
    preview: Preview | null;
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

export interface GET_LIBRARIES_LIST_libraries_list_previewsSettings_versions_sizes {
    name: string;
    size: number;
}

export interface GET_LIBRARIES_LIST_libraries_list_previewsSettings_versions {
    background: string;
    density: number;
    sizes: GET_LIBRARIES_LIST_libraries_list_previewsSettings_versions_sizes[];
}

export interface GET_LIBRARIES_LIST_libraries_list_previewsSettings {
    description: SystemTranslation | null;
    label: SystemTranslation;
    system: boolean;
    versions: GET_LIBRARIES_LIST_libraries_list_previewsSettings_versions;
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
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    icon: GET_LIBRARIES_LIST_libraries_list_icon | null;
    gqlNames: GET_LIBRARIES_LIST_libraries_list_gqlNames;
    previewsSettings: GET_LIBRARIES_LIST_libraries_list_previewsSettings[] | null;
    permissions: GET_LIBRARIES_LIST_libraries_list_permissions | null;
}

export interface GET_LIBRARIES_LIST_libraries {
    list: GET_LIBRARIES_LIST_libraries_list[];
}

export interface GET_LIBRARIES_LIST {
    libraries: GET_LIBRARIES_LIST_libraries | null;
}

export interface GET_LIBRARIES_LISTVariables {
    filters?: LibrariesFiltersInput | null;
}
