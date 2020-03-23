/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES_VALUES_LIST
// ====================================================

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_StandardAttribute_values_list | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues {
    whoAmI: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues_whoAmI;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    linkValues: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list_linkValues[] | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute_values_list | null;
    linked_library: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record {
    whoAmI: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_record_whoAmI;
}

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    preview: string | null;
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

export interface GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    values_list: GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute_values_list | null;
    linked_tree: string | null;
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
