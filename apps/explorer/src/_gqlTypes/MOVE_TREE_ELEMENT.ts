// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeElementInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: MOVE_TREE_ELEMENT
// ====================================================

export interface MOVE_TREE_ELEMENT_treeMoveElement {
    id: string | null;
}

export interface MOVE_TREE_ELEMENT {
    treeMoveElement: MOVE_TREE_ELEMENT_treeMoveElement;
}

export interface MOVE_TREE_ELEMENTVariables {
    treeId: string;
    element: TreeElementInput;
    parentTo?: TreeElementInput | null;
    order?: number | null;
}
