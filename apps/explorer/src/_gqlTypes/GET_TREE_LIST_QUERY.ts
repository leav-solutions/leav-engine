// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_TREE_LIST_QUERY
// ====================================================

export interface GET_TREE_LIST_QUERY_trees_list_libraries_library {
    id: string;
    label: any | null;
}

export interface GET_TREE_LIST_QUERY_trees_list_libraries {
    library: GET_TREE_LIST_QUERY_trees_list_libraries_library;
}

export interface GET_TREE_LIST_QUERY_trees_list {
    id: string;
    label: any | null;
    libraries: GET_TREE_LIST_QUERY_trees_list_libraries[];
}

export interface GET_TREE_LIST_QUERY_trees {
    list: GET_TREE_LIST_QUERY_trees_list[];
}

export interface GET_TREE_LIST_QUERY {
    trees: GET_TREE_LIST_QUERY_trees | null;
}

export interface GET_TREE_LIST_QUERYVariables {
    treeId?: string | null;
}
