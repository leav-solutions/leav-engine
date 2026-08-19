/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    AttributeType,
    AttributeFormat,
    PermissionsRelation,
    ValueVersionMode,
    MultiDisplayOption,
    TreeSelectableNodes,
} from './index';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTE_BY_ID
// ====================================================

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf_profile_trees[];
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf_profile | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    settings: JSONObject | null;
    multi_link_display_option: MultiDisplayOption | null;
    multi_tree_display_option: MultiDisplayOption | null;
    column_split_enabled?: boolean | null;
    metadata_fields: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_permissions_conf | null;
    versions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf | null;
    libraries: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_libraries[] | null;
    unique: boolean | null;
    character_limit: number | null;
    smart_filter: null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf_profile_trees[];
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf_profile | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_linked_library {
    id: string;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    settings: JSONObject | null;
    multi_link_display_option: MultiDisplayOption | null;
    multi_tree_display_option: MultiDisplayOption | null;
    column_split_enabled?: boolean | null;
    metadata_fields: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_permissions_conf | null;
    versions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_versions_conf | null;
    libraries: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_libraries[] | null;
    linked_library: GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute_linked_library | null;
    reverse_link: string | null;
    smart_filter: { enable: boolean | null } | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_dependent_values {
    dependenciesTreeAttributes: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute[];
    allowByDefault: boolean;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf_profile_trees[];
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf_profile | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_tree_selection_conf {
    selectableNodes: TreeSelectableNodes | null;
    defaultExpanded: boolean | null;
    displayRootNode: string | null;
    maxDepth: number | null;
    showSelectChildrenButton: boolean | null;
    showSelectDescendantsButton: boolean | null;
}

export interface GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    settings: JSONObject | null;
    multi_link_display_option: MultiDisplayOption | null;
    multi_tree_display_option: MultiDisplayOption | null;
    column_split_enabled?: boolean | null;
    metadata_fields: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_metadata_fields[] | null;
    permissions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf | null;
    permissions_conf_dependent_values?: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_permissions_conf_dependent_values | null;
    versions_conf: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_versions_conf | null;
    libraries: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_libraries[] | null;
    linked_tree: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_linked_tree | null;
    tree_selection_conf?: GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute_tree_selection_conf | null;
    smart_filter: null;
}

export type GET_ATTRIBUTE_BY_ID_attributes_list =
    | GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute
    | GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute
    | GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute;

export interface GET_ATTRIBUTE_BY_ID_attributes {
    totalCount: number;
    list: GET_ATTRIBUTE_BY_ID_attributes_list[];
}

export interface GET_ATTRIBUTE_BY_ID {
    attributes: GET_ATTRIBUTE_BY_ID_attributes | null;
}

export interface GET_ATTRIBUTE_BY_IDVariables {
    id?: string | null;
}
