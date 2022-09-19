// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_TREE_LIBRARIES
// ====================================================

export interface GET_TREE_LIBRARIES_trees_list_libraries_library {
    id: string;
    label: any | null;
}

export interface GET_TREE_LIBRARIES_trees_list_libraries_settings {
    allowMultiplePositions: boolean;
    allowedChildren: string[];
    allowedAtRoot: boolean;
}

export interface GET_TREE_LIBRARIES_trees_list_libraries {
    library: GET_TREE_LIBRARIES_trees_list_libraries_library;
    settings: GET_TREE_LIBRARIES_trees_list_libraries_settings;
}

export interface GET_TREE_LIBRARIES_trees_list {
    id: string;
    libraries: GET_TREE_LIBRARIES_trees_list_libraries[];
}

export interface GET_TREE_LIBRARIES_trees {
    totalCount: number;
    list: GET_TREE_LIBRARIES_trees_list[];
}

export interface GET_TREE_LIBRARIES {
    trees: GET_TREE_LIBRARIES_trees | null;
}

export interface GET_TREE_LIBRARIESVariables {
    treeId: string;
}
