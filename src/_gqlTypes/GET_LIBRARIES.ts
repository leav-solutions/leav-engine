/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeFormat, AttributeType, AvailableLanguage, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARIES
// ====================================================

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: GET_LIBRARIES_libraries_list_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: GET_LIBRARIES_libraries_list_attributes_StandardAttribute_versions_conf | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: GET_LIBRARIES_libraries_list_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: GET_LIBRARIES_libraries_list_attributes_LinkAttribute_versions_conf | null;
    linked_library: string | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: GET_LIBRARIES_libraries_list_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: GET_LIBRARIES_libraries_list_attributes_TreeAttribute_versions_conf | null;
    linked_tree: string | null;
}

export type GET_LIBRARIES_libraries_list_attributes =
    | GET_LIBRARIES_libraries_list_attributes_StandardAttribute
    | GET_LIBRARIES_libraries_list_attributes_LinkAttribute
    | GET_LIBRARIES_libraries_list_attributes_TreeAttribute;

export interface GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export type GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes =
    | GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_LIBRARIES_libraries_list_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
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
    attributes: GET_LIBRARIES_libraries_list_attributes[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_permissions_conf | null;
    recordIdentityConf: GET_LIBRARIES_libraries_list_recordIdentityConf | null;
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
    lang?: AvailableLanguage[] | null;
}
