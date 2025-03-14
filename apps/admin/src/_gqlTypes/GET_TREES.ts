// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreesFiltersInput, TreeBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREES
// ====================================================

export interface GET_TREES_trees_list_libraries_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_TREES_trees_list_libraries_settings {
    allowMultiplePositions: boolean;
    allowedAtRoot: boolean;
    allowedChildren: string[];
}

export interface GET_TREES_trees_list_libraries {
    library: GET_TREES_trees_list_libraries_library;
    settings: GET_TREES_trees_list_libraries_settings;
}

export interface GET_TREES_trees_list {
    id: string;
    label: SystemTranslation | null;
    system: boolean;
    behavior: TreeBehavior;
    libraries: GET_TREES_trees_list_libraries[];
}

export interface GET_TREES_trees {
    totalCount: number;
    list: GET_TREES_trees_list[];
}

export interface GET_TREES {
    trees: GET_TREES_trees | null;
}

export interface GET_TREESVariables {
    filters?: TreesFiltersInput | null;
}
