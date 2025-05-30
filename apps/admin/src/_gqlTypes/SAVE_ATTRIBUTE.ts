// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeInput, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode, MultiLinkDisplayOption} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE
// ====================================================

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf_profile_trees[];
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf_profile | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    allowListUpdate: boolean | null;
    values: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    allowListUpdate: boolean | null;
    dateRangeValues:
        | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list =
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardStringValuesListConf
    | SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list_StandardDateRangeValuesListConf;

export interface SAVE_ATTRIBUTE_saveAttribute_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_versions_conf | null;
    libraries: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_libraries[] | null;
    unique: boolean | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_StandardAttribute_values_list | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf_profile_trees[];
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf_profile | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_linked_library {
    id: string;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    allowListUpdate: boolean | null;
    linkValues: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list_linkValues[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_versions_conf | null;
    libraries: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_libraries[] | null;
    linked_library: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_linked_library | null;
    reverse_link: string | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_LinkAttribute_values_list | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf_profile_trees[];
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf_profile | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI {
    id: string;
    library: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record {
    whoAmI: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors {
    record: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors_record | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues {
    id: string;
    record: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_record | null;
    ancestors: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues_ancestors[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    allowListUpdate: boolean | null;
    treeValues: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list_treeValues[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_versions_conf | null;
    libraries: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_libraries[] | null;
    linked_tree: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_linked_tree | null;
    values_list: SAVE_ATTRIBUTE_saveAttribute_TreeAttribute_values_list | null;
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
