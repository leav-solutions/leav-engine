// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeInput, TreeBehavior} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_TREE
// ====================================================

export interface SAVE_TREE_saveTree_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_TREE_saveTree {
    id: string;
    system: boolean;
    label: SystemTranslation | null;
    behavior: TreeBehavior;
    libraries: SAVE_TREE_saveTree_libraries[];
}

export interface SAVE_TREE {
    saveTree: SAVE_TREE_saveTree;
}

export interface SAVE_TREEVariables {
    treeData: TreeInput;
}
