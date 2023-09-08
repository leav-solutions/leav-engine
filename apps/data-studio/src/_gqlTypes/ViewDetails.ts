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
// GraphQL fragment: ViewDetails
// ====================================================

export interface ViewDetails_display {
    size: ViewSizes;
    type: ViewTypes;
}

export interface ViewDetails_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ViewDetails_created_by_whoAmI_library {
    id: string;
    gqlNames: ViewDetails_created_by_whoAmI_library_gqlNames;
}

export interface ViewDetails_created_by_whoAmI {
    id: string;
    label: string | null;
    library: ViewDetails_created_by_whoAmI_library;
}

export interface ViewDetails_created_by {
    id: string;
    whoAmI: ViewDetails_created_by_whoAmI;
}

export interface ViewDetails_filters_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface ViewDetails_filters {
    field: string | null;
    value: string | null;
    tree: ViewDetails_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface ViewDetails_sort {
    field: string;
    order: SortOrder;
}

export interface ViewDetails_valuesVersions_treeNode_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ViewDetails_valuesVersions_treeNode_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ViewDetails_valuesVersions_treeNode_record_whoAmI_library_gqlNames;
}

export interface ViewDetails_valuesVersions_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: ViewDetails_valuesVersions_treeNode_record_whoAmI_library;
    preview: Preview | null;
}

export interface ViewDetails_valuesVersions_treeNode_record {
    id: string;
    whoAmI: ViewDetails_valuesVersions_treeNode_record_whoAmI;
}

export interface ViewDetails_valuesVersions_treeNode {
    id: string;
    record: ViewDetails_valuesVersions_treeNode_record | null;
}

export interface ViewDetails_valuesVersions {
    treeId: string;
    treeNode: ViewDetails_valuesVersions_treeNode;
}

export interface ViewDetails_settings {
    name: string;
    value: Any | null;
}

export interface ViewDetails {
    id: string;
    display: ViewDetails_display;
    shared: boolean;
    created_by: ViewDetails_created_by;
    label: SystemTranslation;
    description: SystemTranslation | null;
    color: string | null;
    filters: ViewDetails_filters[] | null;
    sort: ViewDetails_sort | null;
    valuesVersions: ViewDetails_valuesVersions[] | null;
    settings: ViewDetails_settings[] | null;
}
