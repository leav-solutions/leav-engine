/* tslint:disable */
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
