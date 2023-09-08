/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    ViewInput,
    ViewSizes,
    ViewTypes,
    RecordFilterCondition,
    RecordFilterOperator,
    SortOrder,
    LibraryBehavior
} from './globalTypes';

// ====================================================
// GraphQL mutation operation: ADD_VIEW
// ====================================================

export interface ADD_VIEW_saveView_display {
    size: ViewSizes;
    type: ViewTypes;
}

export interface ADD_VIEW_saveView_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ADD_VIEW_saveView_created_by_whoAmI_library {
    id: string;
    gqlNames: ADD_VIEW_saveView_created_by_whoAmI_library_gqlNames;
}

export interface ADD_VIEW_saveView_created_by_whoAmI {
    id: string;
    label: string | null;
    library: ADD_VIEW_saveView_created_by_whoAmI_library;
}

export interface ADD_VIEW_saveView_created_by {
    id: string;
    whoAmI: ADD_VIEW_saveView_created_by_whoAmI;
}

export interface ADD_VIEW_saveView_filters_tree {
    id: string;
    label: SystemTranslation | null;
}

export interface ADD_VIEW_saveView_filters {
    field: string | null;
    value: string | null;
    tree: ADD_VIEW_saveView_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface ADD_VIEW_saveView_sort {
    field: string;
    order: SortOrder;
}

export interface ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI_library_gqlNames;
}

export interface ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI_library;
    preview: Preview | null;
}

export interface ADD_VIEW_saveView_valuesVersions_treeNode_record {
    id: string;
    whoAmI: ADD_VIEW_saveView_valuesVersions_treeNode_record_whoAmI;
}

export interface ADD_VIEW_saveView_valuesVersions_treeNode {
    id: string;
    record: ADD_VIEW_saveView_valuesVersions_treeNode_record | null;
}

export interface ADD_VIEW_saveView_valuesVersions {
    treeId: string;
    treeNode: ADD_VIEW_saveView_valuesVersions_treeNode;
}

export interface ADD_VIEW_saveView_settings {
    name: string;
    value: Any | null;
}

export interface ADD_VIEW_saveView {
    id: string;
    display: ADD_VIEW_saveView_display;
    shared: boolean;
    created_by: ADD_VIEW_saveView_created_by;
    label: SystemTranslation;
    description: SystemTranslation | null;
    color: string | null;
    filters: ADD_VIEW_saveView_filters[] | null;
    sort: ADD_VIEW_saveView_sort | null;
    valuesVersions: ADD_VIEW_saveView_valuesVersions[] | null;
    settings: ADD_VIEW_saveView_settings[] | null;
}

export interface ADD_VIEW {
    saveView: ADD_VIEW_saveView;
}

export interface ADD_VIEWVariables {
    view: ViewInput;
}
