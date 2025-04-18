// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, TreeBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREES
// ====================================================

export interface GET_TREES_trees_list_libraries_library {
    id: string;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
}

export interface GET_TREES_trees_list_libraries {
    library: GET_TREES_trees_list_libraries_library;
}

export interface GET_TREES_trees_list_permissions {
    access_tree: boolean;
    edit_children: boolean;
}

export interface GET_TREES_trees_list {
    id: string;
    label: SystemTranslation | null;
    libraries: GET_TREES_trees_list_libraries[];
    behavior: TreeBehavior;
    permissions: GET_TREES_trees_list_permissions;
}

export interface GET_TREES_trees {
    list: GET_TREES_trees_list[];
}

export interface GET_TREES {
    trees: GET_TREES_trees | null;
}
