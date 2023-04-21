/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes_list_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    unique: boolean | null;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute_linked_library {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_LinkAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    linked_library: GET_ATTRIBUTES_attributes_list_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_ATTRIBUTES_attributes_list_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
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
    id?: string | null;
    label?: string | null;
    type?: (AttributeType | null)[] | null;
    format?: (AttributeFormat | null)[] | null;
    system?: boolean | null;
    multiple_values?: boolean | null;
    versionable?: boolean | null;
    libraries?: string[] | null;
}
