/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeBehavior, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ACTIVE_TREE
// ====================================================

export interface GET_ACTIVE_TREE_activeTree_libraries {
    id: string;
    behavior: LibraryBehavior;
}

export interface GET_ACTIVE_TREE_activeTree_permissions {
    access_tree: boolean;
    edit_children: boolean;
}

export interface GET_ACTIVE_TREE_activeTree {
    id: string;
    behavior: TreeBehavior;
    libraries: GET_ACTIVE_TREE_activeTree_libraries[];
    label: string;
    permissions: GET_ACTIVE_TREE_activeTree_permissions;
}

export interface GET_ACTIVE_TREE {
    activeTree: GET_ACTIVE_TREE_activeTree | null;
}
