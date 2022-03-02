// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_TREE_CONTENT
// ====================================================

export interface GET_TREE_CONTENT_treeContent_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_TREE_CONTENT_treeContent_record_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_TREE_CONTENT_treeContent_record_whoAmI_library_gqlNames;
}

export interface GET_TREE_CONTENT_treeContent_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
}

export interface GET_TREE_CONTENT_treeContent_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_TREE_CONTENT_treeContent_record_whoAmI_library;
    preview: GET_TREE_CONTENT_treeContent_record_whoAmI_preview | null;
}

export interface GET_TREE_CONTENT_treeContent_record {
    id: string;
    whoAmI: GET_TREE_CONTENT_treeContent_record_whoAmI;
}

export interface GET_TREE_CONTENT_treeContent_permissions {
    access_tree: boolean;
    detach: boolean;
    edit_children: boolean;
}

export interface GET_TREE_CONTENT_treeContent {
    id: string;
    childrenCount: number | null;
    record: GET_TREE_CONTENT_treeContent_record;
    permissions: GET_TREE_CONTENT_treeContent_permissions;
}

export interface GET_TREE_CONTENT {
    /**
     * Retrieve tree content.
     * If startAt is specified, it returns this element's children. Otherwise, it starts
     * from tree root
     */
    treeContent: GET_TREE_CONTENT_treeContent[] | null;
}

export interface GET_TREE_CONTENTVariables {
    treeId: string;
    startAt?: string | null;
}
