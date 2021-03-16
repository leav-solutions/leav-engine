// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeElementInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: REMOVE_TREE_ELEMENT
// ====================================================

export interface REMOVE_TREE_ELEMENT_treeDeleteElement {
    id: string | null;
}

export interface REMOVE_TREE_ELEMENT {
    treeDeleteElement: REMOVE_TREE_ELEMENT_treeDeleteElement;
}

export interface REMOVE_TREE_ELEMENTVariables {
    treeId: string;
    element: TreeElementInput;
    deleteChildren?: boolean | null;
}
