// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_ACTIVE_TREE
// ====================================================

export interface GET_ACTIVE_TREE_activeTree_libraries {
    id: string | null;
}

export interface GET_ACTIVE_TREE_activeTree {
    id: string;
    libraries: GET_ACTIVE_TREE_activeTree_libraries[];
    label: string;
}

export interface GET_ACTIVE_TREE {
    activeTree: GET_ACTIVE_TREE_activeTree | null;
}
