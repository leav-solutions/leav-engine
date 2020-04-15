/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeFormat, AttributeInput, AttributeType, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE
// ====================================================

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_metadata_fields[] | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI_library {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    linkValues: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_metadata_fields[] | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list | null;
    linked_library: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors {
    record: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues {
    record: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record;
    ancestors: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    treeValues: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_metadata_fields[] | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list | null;
    linked_tree: string | null;
}

export type SAVE_ATTRIBUTE_saveAttribute =
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_LinkAttribute
    | SAVE_ATTRIBUTE_saveAttribute_TreeAttribute;

export interface SAVE_ATTRIBUTE {
    saveAttribute: SAVE_ATTRIBUTE_saveAttribute;
}

export interface SAVE_ATTRIBUTEVariables {
    attrData: AttributeInput;
}
