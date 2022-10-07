// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {Pagination} from './globalTypes';

// ====================================================
// GraphQL query operation: TREE_NODE_CHILDREN
// ====================================================

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI {
    id: string;
    library: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_preview | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record {
    whoAmI: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list {
    id: string;
    order: number;
    childrenCount: number | null;
    record: TREE_NODE_CHILDREN_treeNodeChildren_list_record;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren {
    list: TREE_NODE_CHILDREN_treeNodeChildren_list[];
}

export interface TREE_NODE_CHILDREN {
    /**
     * Retrieve direct children of a node. If node is not specified, retrieves root children
     */
    treeNodeChildren: TREE_NODE_CHILDREN_treeNodeChildren;
}

export interface TREE_NODE_CHILDRENVariables {
    treeId: string;
    node?: string | null;
    pagination?: Pagination | null;
}
