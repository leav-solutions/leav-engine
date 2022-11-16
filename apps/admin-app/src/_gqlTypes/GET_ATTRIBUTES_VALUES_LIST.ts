// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES_VALUES_LIST
// ====================================================

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list =
    | GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardStringValuesListConf
    | GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list_StandardDateRangeValuesListConf;

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    unique: boolean | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI {
    id: string;
    library: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI_preview | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues {
    whoAmI: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    linkValues: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_linked_library {
    id: string;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list | null;
    linked_library: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI {
    id: string;
    library: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI_preview | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record {
    whoAmI: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI {
    id: string;
    library: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_preview | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record {
    whoAmI: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors {
    record: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues {
    record: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record;
    ancestors: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    treeValues: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list | null;
    linked_tree: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_linked_tree | null;
}

export type GET_ATTRIBUTES_VALUES_LIST_attributes_list =
    | GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute
    | GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute
    | GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute;

export interface GET_ATTRIBUTES_VALUES_LIST_attributes {
    list: GET_ATTRIBUTES_VALUES_LIST_attributes_list[];
}

export interface GET_ATTRIBUTES_VALUES_LIST {
    attributes: GET_ATTRIBUTES_VALUES_LIST_attributes | null;
}

export interface GET_ATTRIBUTES_VALUES_LISTVariables {
    attrId: string;
}
