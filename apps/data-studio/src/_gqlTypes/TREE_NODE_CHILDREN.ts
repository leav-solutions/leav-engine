// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, Pagination} from './globalTypes';

// ====================================================
// GraphQL query operation: TREE_NODE_CHILDREN
// ====================================================

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library;
    preview: Preview | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record {
    id: string;
    whoAmI: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI;
    active: boolean | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_permissions {
    access_tree: boolean;
    detach: boolean;
    edit_children: boolean;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list {
    id: string;
    childrenCount: number | null;
    record: TREE_NODE_CHILDREN_treeNodeChildren_list_record;
    permissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren {
    totalCount: number | null;
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
