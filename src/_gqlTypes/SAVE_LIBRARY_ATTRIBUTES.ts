/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_LIBRARY_ATTRIBUTES
// ====================================================

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_library: string | null;
    linked_tree: string | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_versions_conf | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary {
    id: string;
    attributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes[] | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES {
    saveLibrary: SAVE_LIBRARY_ATTRIBUTES_saveLibrary;
}

export interface SAVE_LIBRARY_ATTRIBUTESVariables {
    libId: string;
    attributes: string[];
    lang?: AvailableLanguage[] | null;
}
