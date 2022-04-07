// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    AvailableLanguage,
    LibraryBehavior,
    AttributeType,
    AttributeFormat,
    PermissionsRelation,
    ValueVersionMode
} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIB_BY_ID
// ====================================================

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_versions_conf | null;
    libraries: GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute_libraries[] | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_versions_conf | null;
    libraries: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_libraries[] | null;
    linked_library: GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_versions_conf | null;
    libraries: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_libraries[] | null;
    linked_tree: GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute_linked_tree | null;
}

export type GET_LIB_BY_ID_libraries_list_attributes =
    | GET_LIB_BY_ID_libraries_list_attributes_StandardAttribute
    | GET_LIB_BY_ID_libraries_list_attributes_LinkAttribute
    | GET_LIB_BY_ID_libraries_list_attributes_TreeAttribute;

export interface GET_LIB_BY_ID_libraries_list_fullTextAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
    label: SystemTranslation | null;
}

export type GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes =
    | GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIB_BY_ID_libraries_list_permissions_conf {
    permissionTreeAttributes: GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIB_BY_ID_libraries_list_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface GET_LIB_BY_ID_libraries_list_defaultView {
    id: string;
}

export interface GET_LIB_BY_ID_libraries_list_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIB_BY_ID_libraries_list_permissions {
    admin_library: boolean;
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface GET_LIB_BY_ID_libraries_list {
    id: string;
    system: boolean | null;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    attributes: GET_LIB_BY_ID_libraries_list_attributes[] | null;
    fullTextAttributes: GET_LIB_BY_ID_libraries_list_fullTextAttributes[] | null;
    permissions_conf: GET_LIB_BY_ID_libraries_list_permissions_conf | null;
    recordIdentityConf: GET_LIB_BY_ID_libraries_list_recordIdentityConf | null;
    defaultView: GET_LIB_BY_ID_libraries_list_defaultView | null;
    gqlNames: GET_LIB_BY_ID_libraries_list_gqlNames;
    permissions: GET_LIB_BY_ID_libraries_list_permissions | null;
}

export interface GET_LIB_BY_ID_libraries {
    list: GET_LIB_BY_ID_libraries_list[];
}

export interface GET_LIB_BY_ID {
    libraries: GET_LIB_BY_ID_libraries | null;
}

export interface GET_LIB_BY_IDVariables {
    id?: string | null;
    lang?: AvailableLanguage[] | null;
}
