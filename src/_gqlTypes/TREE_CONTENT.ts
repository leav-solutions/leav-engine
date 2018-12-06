/* tslint:disable */
// This file was automatically generated and should not be edited.

import {TreeElementInput, AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL query operation: TREE_CONTENT
// ====================================================

export interface TREE_CONTENT_treeContent_record_library {
    id: string;
    label: any | null;
}

export interface TREE_CONTENT_treeContent_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface TREE_CONTENT_treeContent_record_whoAmI {
    id: string;
    library: TREE_CONTENT_treeContent_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface TREE_CONTENT_treeContent_record {
    id: string;
    library: TREE_CONTENT_treeContent_record_library;
    whoAmI: TREE_CONTENT_treeContent_record_whoAmI;
}

export interface TREE_CONTENT_treeContent_children_record_library {
    id: string;
    label: any | null;
}

export interface TREE_CONTENT_treeContent_children_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface TREE_CONTENT_treeContent_children_record_whoAmI {
    id: string;
    library: TREE_CONTENT_treeContent_children_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface TREE_CONTENT_treeContent_children_record {
    id: string;
    library: TREE_CONTENT_treeContent_children_record_library;
    whoAmI: TREE_CONTENT_treeContent_children_record_whoAmI;
}

export interface TREE_CONTENT_treeContent_children {
    order: number;
    record: TREE_CONTENT_treeContent_children_record;
}

export interface TREE_CONTENT_treeContent {
    order: number;
    record: TREE_CONTENT_treeContent_record;
    children: TREE_CONTENT_treeContent_children[] | null;
}

export interface TREE_CONTENT {
    /**
     * Retrieve tree content.
     * If startAt is specified, it returns this element's children. Otherwise, it starts
     * from tree root
     */
    treeContent: TREE_CONTENT_treeContent[] | null;
}

export interface TREE_CONTENTVariables {
    treeId: string;
    startAt?: TreeElementInput | null;
    lang?: AvailableLanguage[] | null;
}
