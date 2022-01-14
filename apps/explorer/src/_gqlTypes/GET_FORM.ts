// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributePermissionsRecord, FormElementTypes, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_FORM
// ====================================================

export interface GET_FORM_forms_list_library {
    id: string;
}

export interface GET_FORM_forms_list_dependencyAttributes {
    id: string;
    label: any | null;
}

export interface GET_FORM_forms_list_elements_dependencyValue_value {
    id: string | null;
    library: string | null;
}

export interface GET_FORM_forms_list_elements_dependencyValue {
    attribute: string;
    value: GET_FORM_forms_list_elements_dependencyValue_value;
}

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list =
    | GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf
    | GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf;

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute {
    id: string;
    label: any | null;
    description: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_permissions;
    values_list: GET_FORM_forms_list_elements_elements_attribute_StandardAttribute_values_list | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library_gqlNames {
    type: string;
    query: string;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library {
    id: string;
    label: any | null;
    gqlNames: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library_gqlNames;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library_gqlNames;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_library;
    preview: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI_preview | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values {
    id: string;
    whoAmI: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values[] | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute {
    id: string;
    label: any | null;
    description: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_permissions;
    linked_library: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library | null;
    linkValuesList: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_permissions {
    access_attribute: boolean;
    edit_value: boolean;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_linked_tree {
    id: string;
    label: any | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library_gqlNames;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_library;
    preview: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI_preview | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record {
    id: string;
    whoAmI: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record_whoAmI;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library_gqlNames;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_library;
    preview: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI_preview | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record {
    id: string;
    whoAmI: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record_whoAmI;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors {
    record: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors_record;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values {
    record: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_record;
    ancestors: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values_ancestors[][] | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values[] | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute {
    id: string;
    label: any | null;
    description: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    /**
     * Permissions for this attribute.
     * If record is specified, returns permissions for this specific record, otherwise returns global attribute permissions
     */
    permissions: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_permissions;
    linked_tree: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_linked_tree | null;
    treeValuesList: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList | null;
}

export type GET_FORM_forms_list_elements_elements_attribute =
    | GET_FORM_forms_list_elements_elements_attribute_StandardAttribute
    | GET_FORM_forms_list_elements_elements_attribute_LinkAttribute
    | GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;

export interface GET_FORM_forms_list_elements_elements_settings {
    key: string;
    value: any;
}

export interface GET_FORM_forms_list_elements_elements {
    id: string;
    containerId: string;
    uiElementType: string;
    type: FormElementTypes;
    attribute: GET_FORM_forms_list_elements_elements_attribute | null;
    settings: GET_FORM_forms_list_elements_elements_settings[];
}

export interface GET_FORM_forms_list_elements {
    dependencyValue: GET_FORM_forms_list_elements_dependencyValue | null;
    elements: GET_FORM_forms_list_elements_elements[];
}

export interface GET_FORM_forms_list {
    id: string;
    library: GET_FORM_forms_list_library;
    dependencyAttributes: GET_FORM_forms_list_dependencyAttributes[] | null;
    elements: GET_FORM_forms_list_elements[];
}

export interface GET_FORM_forms {
    list: GET_FORM_forms_list[];
}

export interface GET_FORM {
    forms: GET_FORM_forms | null;
}

export interface GET_FORMVariables {
    library: string;
    formId: string;
    record?: AttributePermissionsRecord | null;
}
