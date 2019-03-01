/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {TreeInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_TREE
// ====================================================

export interface SAVE_TREE_saveTree {
    id: string;
    system: boolean;
    label: any | null;
    libraries: string[];
}

export interface SAVE_TREE {
    saveTree: SAVE_TREE_saveTree;
}

export interface SAVE_TREEVariables {
    treeData: TreeInput;
}
