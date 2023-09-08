// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREE_ATTRIBUTES_QUERY
// ====================================================

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_gqlNames {
    type: string;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_StandardAttribute_embedded_fields {
    id: string;
    format: AttributeFormat | null;
    label: SystemTranslation | null;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: SystemTranslation | null;
    multiple_values: boolean;
    embedded_fields:
        | (GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_StandardAttribute_embedded_fields | null)[]
        | null;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: SystemTranslation | null;
    multiple_values: boolean;
    linked_library: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_LinkAttribute_linked_library | null;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_TreeAttribute_linked_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: SystemTranslation | null;
    multiple_values: boolean;
    linked_tree: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_TreeAttribute_linked_tree | null;
}

export type GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes =
    | GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_StandardAttribute
    | GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_LinkAttribute
    | GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes_TreeAttribute;

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library {
    id: string;
    label: SystemTranslation | null;
    gqlNames: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_gqlNames;
    attributes: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library_attributes[] | null;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries {
    library: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries_library;
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees_list {
    id: string;
    libraries: GET_TREE_ATTRIBUTES_QUERY_trees_list_libraries[];
}

export interface GET_TREE_ATTRIBUTES_QUERY_trees {
    list: GET_TREE_ATTRIBUTES_QUERY_trees_list[];
}

export interface GET_TREE_ATTRIBUTES_QUERY {
    trees: GET_TREE_ATTRIBUTES_QUERY_trees | null;
}

export interface GET_TREE_ATTRIBUTES_QUERYVariables {
    treeId?: string[] | null;
}
