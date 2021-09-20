/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARIES_AND_TREES_LIST
// ====================================================

export interface GET_LIBRARIES_AND_TREES_LIST_libraries_list_gqlNames {
  query: string;
  filter: string;
  searchableFields: string;
}

export interface GET_LIBRARIES_AND_TREES_LIST_libraries_list {
  id: string;
  label: any | null;
  gqlNames: GET_LIBRARIES_AND_TREES_LIST_libraries_list_gqlNames;
}

export interface GET_LIBRARIES_AND_TREES_LIST_libraries {
  list: GET_LIBRARIES_AND_TREES_LIST_libraries_list[];
}

export interface GET_LIBRARIES_AND_TREES_LIST_trees_list_libraries_library {
  id: string;
  label: any | null;
}

export interface GET_LIBRARIES_AND_TREES_LIST_trees_list_libraries {
  library: GET_LIBRARIES_AND_TREES_LIST_trees_list_libraries_library;
}

export interface GET_LIBRARIES_AND_TREES_LIST_trees_list {
  id: string;
  label: any | null;
  libraries: GET_LIBRARIES_AND_TREES_LIST_trees_list_libraries[];
}

export interface GET_LIBRARIES_AND_TREES_LIST_trees {
  list: GET_LIBRARIES_AND_TREES_LIST_trees_list[];
}

export interface GET_LIBRARIES_AND_TREES_LIST {
  libraries: GET_LIBRARIES_AND_TREES_LIST_libraries | null;
  trees: GET_LIBRARIES_AND_TREES_LIST_trees | null;
}
