// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    AttributeFormat,
    AttributeType,
    LibraryBehavior,
    RecordFilterCondition,
    RecordFilterOperator,
    SortOrder,
    ViewSizes,
    ViewTypes
} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARY_DETAIL_EXTENDED
// ====================================================

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees_permissions {
    access_tree: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees {
    id: string;
    label: any | null;
    permissions: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees_permissions;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_StandardAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    system: boolean;
    id: string;
    readonly: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_StandardAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    system: boolean;
    id: string;
    readonly: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_LinkAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    system: boolean;
    id: string;
    readonly: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute_linked_library_attributes_TreeAttribute {
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    system: boolean;
    id: string;
    readonly: boolean;
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
    system: boolean;
    readonly: boolean;
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
    readonly: boolean;
    system: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    readonly: boolean;
    system: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
    multiple_values: boolean;
    readonly: boolean;
    system: boolean;
}

export type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes =
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_StandardAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_LinkAttribute
    | GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library_attributes_TreeAttribute;

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute_linked_tree_libraries_library {
    id: string;
    label: any | null;
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
    system: boolean;
    readonly: boolean;
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

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_display {
    size: ViewSizes;
    type: ViewTypes;
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
export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions {
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView {
    id: string;
    description: any | null;
    label: any;
    display: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_display | null;
    shared: boolean;
    filters: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_filters[] | null;
    color: string | null;
    sort: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_sort | null;
    settings: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView_settings[] | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries_list {
    id: string;
    system: boolean | null;
    behavior: LibraryBehavior | null;
    label: any | null;
    linkedTrees: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[] | null;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[] | null;
    permissions: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions | null;
    defaultView: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDED_libraries {
    list: GET_LIBRARY_DETAIL_EXTENDED_libraries_list[];
}

export interface GET_LIBRARY_DETAIL_EXTENDED {
    libraries: GET_LIBRARY_DETAIL_EXTENDED_libraries | null;
}

export interface GET_LIBRARY_DETAIL_EXTENDEDVariables {
    libId?: string[] | null;
}
