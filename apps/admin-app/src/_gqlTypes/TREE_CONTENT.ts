// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL query operation: TREE_CONTENT
// ====================================================

export interface TREE_CONTENT_treeContent_record_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface TREE_CONTENT_treeContent_record_whoAmI {
    id: string;
    library: TREE_CONTENT_treeContent_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: TREE_CONTENT_treeContent_record_whoAmI_preview | null;
}

export interface TREE_CONTENT_treeContent_record {
    id: string;
    library: TREE_CONTENT_treeContent_record_library;
    whoAmI: TREE_CONTENT_treeContent_record_whoAmI;
}

export interface TREE_CONTENT_treeContent_ancestors_record_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_ancestors_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface TREE_CONTENT_treeContent_ancestors_record_whoAmI {
    id: string;
    library: TREE_CONTENT_treeContent_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: TREE_CONTENT_treeContent_ancestors_record_whoAmI_preview | null;
}

export interface TREE_CONTENT_treeContent_ancestors_record {
    id: string;
    library: TREE_CONTENT_treeContent_ancestors_record_library;
    whoAmI: TREE_CONTENT_treeContent_ancestors_record_whoAmI;
}

export interface TREE_CONTENT_treeContent_ancestors {
    id: string;
    record: TREE_CONTENT_treeContent_ancestors_record;
}

export interface TREE_CONTENT_treeContent_children_record_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_children_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_CONTENT_treeContent_children_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface TREE_CONTENT_treeContent_children_record_whoAmI {
    id: string;
    library: TREE_CONTENT_treeContent_children_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: TREE_CONTENT_treeContent_children_record_whoAmI_preview | null;
}

export interface TREE_CONTENT_treeContent_children_record {
    id: string;
    library: TREE_CONTENT_treeContent_children_record_library;
    whoAmI: TREE_CONTENT_treeContent_children_record_whoAmI;
}

export interface TREE_CONTENT_treeContent_children {
    id: string;
    order: number;
    record: TREE_CONTENT_treeContent_children_record;
}

export interface TREE_CONTENT_treeContent {
    id: string;
    order: number;
    record: TREE_CONTENT_treeContent_record;
    ancestors: TREE_CONTENT_treeContent_ancestors[] | null;
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
    startAt?: string | null;
    lang?: AvailableLanguage[] | null;
}
