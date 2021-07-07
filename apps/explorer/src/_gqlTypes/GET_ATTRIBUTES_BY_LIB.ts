// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES_BY_LIB
// ====================================================

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute_linked_library {
    id: string;
}

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    linked_library: GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute_linked_library | null;
}

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute_linked_tree {
    id: string;
    label: any | null;
}

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    linked_tree: GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute_linked_tree | null;
}

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields {
    id: string;
    format: AttributeFormat | null;
    label: any | null;
}

export interface GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    embedded_fields: (GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields | null)[] | null;
}

export type GET_ATTRIBUTES_BY_LIB_attributes_list =
    | GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
    | GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
    | GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute;

export interface GET_ATTRIBUTES_BY_LIB_attributes {
    list: GET_ATTRIBUTES_BY_LIB_attributes_list[];
}

export interface GET_ATTRIBUTES_BY_LIB {
    attributes: GET_ATTRIBUTES_BY_LIB_attributes | null;
}

export interface GET_ATTRIBUTES_BY_LIBVariables {
    library: string;
}
