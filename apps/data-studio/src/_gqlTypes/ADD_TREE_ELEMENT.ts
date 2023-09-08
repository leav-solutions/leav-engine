// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeElementInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: ADD_TREE_ELEMENT
// ====================================================

export interface ADD_TREE_ELEMENT_treeAddElement {
    id: string;
}

export interface ADD_TREE_ELEMENT {
    treeAddElement: ADD_TREE_ELEMENT_treeAddElement;
}

export interface ADD_TREE_ELEMENTVariables {
    treeId: string;
    element: TreeElementInput;
    parent?: string | null;
    order?: number | null;
}
