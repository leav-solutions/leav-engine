// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    AttributeType,
    AttributeFormat,
    ViewTypes,
    RecordFilterCondition,
    RecordFilterOperator,
    SortOrder
} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARY_DETAIL_EXTENDED
// ====================================================

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_StandardAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_StandardAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_LinkAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_TreeAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
}

export type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes =
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_StandardAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_LinkAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_TreeAttribute;

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library {
    id: string;
    label: any | null;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes[] | null;
    __typename: 'Library';
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
    linked_library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library | null;
    __typename: 'LinkAttribute';
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
}

export type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes =
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_StandardAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_LinkAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_TreeAttribute;

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library {
    id: string;
    attributes:
        | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes[]
        | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries {
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree {
    id: string;
    label: any | null;
    libraries: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries[];
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    id: string;
    linked_tree: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree | null;
}

export type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes =
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_StandardAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute;

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_gqlNames {
    query: string;
    type: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_filters {
    field: string | null;
    value: string | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_sort {
    field: string | null;
    order: SortOrder;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_settings {
    name: string;
    value: any | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView {
    id: string;
    description: any | null;
    label: any;
    type: ViewTypes;
    shared: boolean;
    filters: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_filters[] | null;
    color: string | null;
    sort: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_sort | null;
    settings: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_settings[] | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list {
    id: string;
    system: boolean | null;
    label: any | null;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[] | null;
    gqlNames: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_gqlNames;
    defaultView: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries {
    list: GET_LIBRARY_DETAIL_EXTENDED_libraries_list[];
}

export interface GET_LIBRARY_DETAIL_EXTENDED {
    libraries: GET_LIBRARY_DETAIL_EXTENDED_libraries | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDEDVariables {
    libId?: string | null;
}
