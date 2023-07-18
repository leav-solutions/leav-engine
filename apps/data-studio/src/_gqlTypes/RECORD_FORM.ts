// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueVersionInput, FormElementTypes, LibraryBehavior, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: RECORD_FORM
// ====================================================

export interface RECORD_FORM_recordForm_library {
    id: string;
}

export interface RECORD_FORM_recordForm_dependencyAttributes {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value_created_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_Value_created_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value_modified_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_Value_modified_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_Value_metadata_value {
    id_value: string | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value_metadata {
    name: string;
    value: RECORD_FORM_recordForm_elements_values_Value_metadata_value | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record_whoAmI_library;
}

export interface RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_Value_version_treeNode {
    id: string;
    record: RECORD_FORM_recordForm_elements_values_Value_version_treeNode_record | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value_version {
    treeId: string;
    treeNode: RECORD_FORM_recordForm_elements_values_Value_version_treeNode | null;
}

export interface RECORD_FORM_recordForm_elements_values_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    created_by: RECORD_FORM_recordForm_elements_values_Value_created_by | null;
    modified_by: RECORD_FORM_recordForm_elements_values_Value_modified_by | null;
    metadata: (RECORD_FORM_recordForm_elements_values_Value_metadata | null)[] | null;
    version: (RECORD_FORM_recordForm_elements_values_Value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_created_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_LinkValue_created_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_modified_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_LinkValue_modified_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_metadata_value {
    id_value: string | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_metadata {
    name: string;
    value: RECORD_FORM_recordForm_elements_values_LinkValue_metadata_value | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode {
    id: string;
    record: RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode_record | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_version {
    treeId: string;
    treeNode: RECORD_FORM_recordForm_elements_values_LinkValue_version_treeNode | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue_linkValue {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_LinkValue_linkValue_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    created_by: RECORD_FORM_recordForm_elements_values_LinkValue_created_by | null;
    modified_by: RECORD_FORM_recordForm_elements_values_LinkValue_modified_by | null;
    metadata: (RECORD_FORM_recordForm_elements_values_LinkValue_metadata | null)[] | null;
    version: (RECORD_FORM_recordForm_elements_values_LinkValue_version | null)[] | null;
    linkValue: RECORD_FORM_recordForm_elements_values_LinkValue_linkValue | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_created_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_TreeValue_created_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_modified_by {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_TreeValue_modified_by_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_metadata_value {
    id_value: string | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_metadata {
    name: string;
    value: RECORD_FORM_recordForm_elements_values_TreeValue_metadata_value | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode {
    id: string;
    record: RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode_record | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_version {
    treeId: string;
    treeNode: RECORD_FORM_recordForm_elements_values_TreeValue_version_treeNode | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors {
    record: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors_record | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue_treeValue {
    id: string;
    record: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_record | null;
    ancestors: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue_ancestors[] | null;
}

export interface RECORD_FORM_recordForm_elements_values_TreeValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    created_by: RECORD_FORM_recordForm_elements_values_TreeValue_created_by | null;
    modified_by: RECORD_FORM_recordForm_elements_values_TreeValue_modified_by | null;
    metadata: (RECORD_FORM_recordForm_elements_values_TreeValue_metadata | null)[] | null;
    version: (RECORD_FORM_recordForm_elements_values_TreeValue_version | null)[] | null;
    treeValue: RECORD_FORM_recordForm_elements_values_TreeValue_treeValue | null;
}

export type RECORD_FORM_recordForm_elements_values =
    | RECORD_FORM_recordForm_elements_values_Value
    | RECORD_FORM_recordForm_elements_values_LinkValue
    | RECORD_FORM_recordForm_elements_values_TreeValue;

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf_profile {
    id: string;
    trees: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf_profile_trees[];
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf {
    versionable: boolean;
    profile: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf_profile | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list =
    | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardStringValuesListConf
    | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf;

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_metadata_fields {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_permissions;
    values_list: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_values_list | null;
    metadata_fields:
        | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields_metadata_fields[]
        | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list =
    | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf
    | RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf;

export interface RECORD_FORM_recordForm_elements_attribute_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_permissions;
    versions_conf: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_versions_conf | null;
    metadata_fields: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields[] | null;
    values_list: RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf_profile {
    id: string;
    trees: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf_profile_trees[];
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf {
    versionable: boolean;
    profile: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf_profile | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list =
    | RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardStringValuesListConf
    | RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf;

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_metadata_fields {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_permissions;
    values_list: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_values_list | null;
    metadata_fields: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields_metadata_fields[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library_gqlNames {
    type: string;
    query: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library_permissions {
    create_record: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library {
    id: string;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    gqlNames: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library_gqlNames;
    permissions: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library_permissions | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_LinkAttribute {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_permissions;
    versions_conf: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_versions_conf | null;
    metadata_fields: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_metadata_fields[] | null;
    linked_library: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library | null;
    linkValuesList: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf_profile {
    id: string;
    trees: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf_profile_trees[];
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf {
    versionable: boolean;
    profile: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf_profile | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list =
    | RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardStringValuesListConf
    | RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list_StandardDateRangeValuesListConf;

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_metadata_fields {
    id: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_permissions;
    values_list: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_values_list | null;
    metadata_fields: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields_metadata_fields[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_linked_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library_gqlNames;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library;
    preview: Preview | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record {
    id: string;
    whoAmI: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors {
    record: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values {
    id: string;
    record: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_record | null;
    ancestors: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values_ancestors[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList_values[] | null;
}

export interface RECORD_FORM_recordForm_elements_attribute_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_permissions;
    versions_conf: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_versions_conf | null;
    metadata_fields: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_metadata_fields[] | null;
    linked_tree: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_linked_tree | null;
    treeValuesList: RECORD_FORM_recordForm_elements_attribute_TreeAttribute_treeValuesList | null;
}

export type RECORD_FORM_recordForm_elements_attribute =
    | RECORD_FORM_recordForm_elements_attribute_StandardAttribute
    | RECORD_FORM_recordForm_elements_attribute_LinkAttribute
    | RECORD_FORM_recordForm_elements_attribute_TreeAttribute;

export interface RECORD_FORM_recordForm_elements_settings {
    key: string;
    value: Any;
}

export interface RECORD_FORM_recordForm_elements {
    id: string;
    containerId: string;
    uiElementType: string;
    type: FormElementTypes;
    valueError: string | null;
    values: RECORD_FORM_recordForm_elements_values[] | null;
    attribute: RECORD_FORM_recordForm_elements_attribute | null;
    settings: RECORD_FORM_recordForm_elements_settings[];
}

export interface RECORD_FORM_recordForm {
    id: string;
    recordId: string | null;
    library: RECORD_FORM_recordForm_library;
    dependencyAttributes: RECORD_FORM_recordForm_dependencyAttributes[] | null;
    elements: RECORD_FORM_recordForm_elements[];
}

export interface RECORD_FORM {
    /**
     * Returns form specific to a record.
     * Only relevant elements are present, dependencies and permissions are already applied
     */
    recordForm: RECORD_FORM_recordForm | null;
}

export interface RECORD_FORMVariables {
    libraryId: string;
    formId: string;
    recordId?: string | null;
    version?: ValueVersionInput[] | null;
}
