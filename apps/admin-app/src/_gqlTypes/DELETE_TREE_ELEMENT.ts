// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeElementInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: DELETE_TREE_ELEMENT
// ====================================================

export interface DELETE_TREE_ELEMENT_treeDeleteElement {
    id: string | null;
    library: string | null;
}

export interface DELETE_TREE_ELEMENT {
    treeDeleteElement: DELETE_TREE_ELEMENT_treeDeleteElement;
}

export interface DELETE_TREE_ELEMENTVariables {
    treeId: string;
    element: TreeElementInput;
    deleteChildren?: boolean | null;
}
