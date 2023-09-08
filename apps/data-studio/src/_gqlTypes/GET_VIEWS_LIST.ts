/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    ViewSizes,
    ViewTypes,
    RecordFilterCondition,
    RecordFilterOperator,
    SortOrder,
    LibraryBehavior
} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_VIEWS_LIST
// ====================================================

export interface GET_VIEWS_LIST_views_list_display {
    size: ViewSizes;
    type: ViewTypes;
}

export interface GET_VIEWS_LIST_views_list_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_VIEWS_LIST_views_list_created_by_whoAmI_library {
    id: string;
    gqlNames: GET_VIEWS_LIST_views_list_created_by_whoAmI_library_gqlNames;
}

export interface GET_VIEWS_LIST_views_list_created_by_whoAmI {
    id: string;
    label: string | null;
    library: GET_VIEWS_LIST_views_list_created_by_whoAmI_library;
}

export interface GET_VIEWS_LIST_views_list_created_by {
    id: string;
    whoAmI: GET_VIEWS_LIST_views_list_created_by_whoAmI;
}

export interface GET_VIEWS_LIST_views_list_filters_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_VIEWS_LIST_views_list_filters {
    field: string | null;
    value: string | null;
    tree: GET_VIEWS_LIST_views_list_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface GET_VIEWS_LIST_views_list_sort {
    field: string;
    order: SortOrder;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library_gqlNames;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library;
    preview: Preview | null;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record {
    id: string;
    whoAmI: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode {
    id: string;
    record: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record | null;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions {
    treeId: string;
    treeNode: GET_VIEWS_LIST_views_list_valuesVersions_treeNode;
}

export interface GET_VIEWS_LIST_views_list_settings {
    name: string;
    value: Any | null;
}

export interface GET_VIEWS_LIST_views_list {
    id: string;
    display: GET_VIEWS_LIST_views_list_display;
    shared: boolean;
    created_by: GET_VIEWS_LIST_views_list_created_by;
    label: SystemTranslation;
    description: SystemTranslation | null;
    color: string | null;
    filters: GET_VIEWS_LIST_views_list_filters[] | null;
    sort: GET_VIEWS_LIST_views_list_sort | null;
    valuesVersions: GET_VIEWS_LIST_views_list_valuesVersions[] | null;
    settings: GET_VIEWS_LIST_views_list_settings[] | null;
}

export interface GET_VIEWS_LIST_views {
    totalCount: number;
    list: GET_VIEWS_LIST_views_list[];
}

export interface GET_VIEWS_LIST {
    views: GET_VIEWS_LIST_views;
}

export interface GET_VIEWS_LISTVariables {
    libraryId: string;
}
