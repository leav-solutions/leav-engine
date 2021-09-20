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

export interface GET_TREE_LIBRARIES_trees_list_libraries {
  library: GET_TREE_LIBRARIES_trees_list_libraries_library;
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
