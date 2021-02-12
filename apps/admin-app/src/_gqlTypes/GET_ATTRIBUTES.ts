// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_ATTRIBUTES_attributes_list_StandardAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTES_attributes_list_StandardAttribute_permissions_conf | null;
    versions_conf: GET_ATTRIBUTES_attributes_list_StandardAttribute_versions_conf | null;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_linked_library {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_ATTRIBUTES_attributes_list_LinkAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTES_attributes_list_LinkAttribute_permissions_conf | null;
    versions_conf: GET_ATTRIBUTES_attributes_list_LinkAttribute_versions_conf | null;
    linked_library: GET_ATTRIBUTES_attributes_list_LinkAttribute_linked_library | null;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: GET_ATTRIBUTES_attributes_list_TreeAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTES_attributes_list_TreeAttribute_permissions_conf | null;
    versions_conf: GET_ATTRIBUTES_attributes_list_TreeAttribute_versions_conf | null;
    linked_tree: GET_ATTRIBUTES_attributes_list_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTES_attributes_list =
    | GET_ATTRIBUTES_attributes_list_StandardAttribute
    | GET_ATTRIBUTES_attributes_list_LinkAttribute
    | GET_ATTRIBUTES_attributes_list_TreeAttribute;

export interface GET_ATTRIBUTES_attributes {
    totalCount: number;
    list: GET_ATTRIBUTES_attributes_list[];
}

export interface GET_ATTRIBUTES {
    attributes: GET_ATTRIBUTES_attributes | null;
}

export interface GET_ATTRIBUTESVariables {
    lang?: AvailableLanguage[] | null;
    id?: string | null;
    label?: string | null;
    type?: (AttributeType | null)[] | null;
    format?: (AttributeFormat | null)[] | null;
    system?: boolean | null;
    multiple_values?: boolean | null;
    versionable?: boolean | null;
    libraries?: string[] | null;
}
