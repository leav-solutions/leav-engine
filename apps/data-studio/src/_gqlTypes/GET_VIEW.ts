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
// GraphQL query operation: GET_VIEW
// ====================================================

export interface GET_VIEW_view_display {
    size: ViewSizes;
    type: ViewTypes;
}

export interface GET_VIEW_view_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_VIEW_view_created_by_whoAmI_library {
    id: string;
    gqlNames: GET_VIEW_view_created_by_whoAmI_library_gqlNames;
}

export interface GET_VIEW_view_created_by_whoAmI {
    id: string;
    label: string | null;
    library: GET_VIEW_view_created_by_whoAmI_library;
}

export interface GET_VIEW_view_created_by {
    id: string;
    whoAmI: GET_VIEW_view_created_by_whoAmI;
}

export interface GET_VIEW_view_filters_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_VIEW_view_filters {
    field: string | null;
    value: string | null;
    tree: GET_VIEW_view_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface GET_VIEW_view_sort {
    field: string;
    order: SortOrder;
}

export interface GET_VIEW_view_valuesVersions_treeNode_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_VIEW_view_valuesVersions_treeNode_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: GET_VIEW_view_valuesVersions_treeNode_record_whoAmI_library_gqlNames;
}

export interface GET_VIEW_view_valuesVersions_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: GET_VIEW_view_valuesVersions_treeNode_record_whoAmI_library;
    preview: Preview | null;
}

export interface GET_VIEW_view_valuesVersions_treeNode_record {
    id: string;
    whoAmI: GET_VIEW_view_valuesVersions_treeNode_record_whoAmI;
}

export interface GET_VIEW_view_valuesVersions_treeNode {
    id: string;
    record: GET_VIEW_view_valuesVersions_treeNode_record | null;
}

export interface GET_VIEW_view_valuesVersions {
    treeId: string;
    treeNode: GET_VIEW_view_valuesVersions_treeNode;
}

export interface GET_VIEW_view_settings {
    name: string;
    value: Any | null;
}

export interface GET_VIEW_view {
    id: string;
    display: GET_VIEW_view_display;
    shared: boolean;
    created_by: GET_VIEW_view_created_by;
    label: SystemTranslation;
    description: SystemTranslation | null;
    color: string | null;
    filters: GET_VIEW_view_filters[] | null;
    sort: GET_VIEW_view_sort | null;
    valuesVersions: GET_VIEW_view_valuesVersions[] | null;
    settings: GET_VIEW_view_settings[] | null;
}

export interface GET_VIEW {
    view: GET_VIEW_view;
}

export interface GET_VIEWVariables {
    viewId: string;
}
