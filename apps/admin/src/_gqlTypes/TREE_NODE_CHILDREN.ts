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
    label: SystemTranslation | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI {
    id: string;
    library: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_record {
    whoAmI: TREE_NODE_CHILDREN_treeNodeChildren_list_record_whoAmI;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_whoAmI {
    id: string;
    library: TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record {
    id: string;
    library: TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_library;
    whoAmI: TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record_whoAmI;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors {
    id: string;
    record: TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors_record | null;
}

export interface TREE_NODE_CHILDREN_treeNodeChildren_list {
    id: string;
    order: number | null;
    childrenCount: number | null;
    record: TREE_NODE_CHILDREN_treeNodeChildren_list_record;
    ancestors: TREE_NODE_CHILDREN_treeNodeChildren_list_ancestors[] | null;
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
