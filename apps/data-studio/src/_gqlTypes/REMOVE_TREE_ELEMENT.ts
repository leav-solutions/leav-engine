// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: REMOVE_TREE_ELEMENT
// ====================================================

export interface REMOVE_TREE_ELEMENT {
    treeDeleteElement: string;
}

export interface REMOVE_TREE_ELEMENTVariables {
    treeId: string;
    nodeId: string;
    deleteChildren?: boolean | null;
}
