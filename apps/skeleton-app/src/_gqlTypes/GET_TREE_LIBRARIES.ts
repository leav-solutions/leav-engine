// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeBehavior, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREE_LIBRARIES
// ====================================================

export interface GET_TREE_LIBRARIES_trees_list_libraries_library {
    id: string;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    system: boolean | null;
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
    behavior: TreeBehavior;
    system: boolean;
    libraries: GET_TREE_LIBRARIES_trees_list_libraries[];
}

export interface GET_TREE_LIBRARIES_trees {
    totalCount: number;
    list: GET_TREE_LIBRARIES_trees_list[];
}

export interface GET_TREE_LIBRARIES {
    trees: GET_TREE_LIBRARIES_trees | null;
}

