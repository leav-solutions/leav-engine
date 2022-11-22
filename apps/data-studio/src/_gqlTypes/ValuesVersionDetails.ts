// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValuesVersionDetails
// ====================================================

export interface ValuesVersionDetails_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValuesVersionDetails_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValuesVersionDetails_treeNode_record_whoAmI_library;
}

export interface ValuesVersionDetails_treeNode_record {
    id: string;
    whoAmI: ValuesVersionDetails_treeNode_record_whoAmI;
}

export interface ValuesVersionDetails_treeNode {
    id: string;
    record: ValuesVersionDetails_treeNode_record;
}

export interface ValuesVersionDetails {
    treeId: string;
    treeNode: ValuesVersionDetails_treeNode | null;
}
