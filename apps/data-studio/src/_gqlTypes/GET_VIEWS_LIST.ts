// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ViewSizes, ViewTypes, RecordFilterCondition, RecordFilterOperator, SortOrder, FileType} from './globalTypes';

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
    label: any | null;
}

export interface GET_VIEWS_LIST_views_list_filters {
    field: string | null;
    value: string | null;
    tree: GET_VIEWS_LIST_views_list_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface GET_VIEWS_LIST_views_list_sort {
    field: string | null;
    order: SortOrder;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library_gqlNames;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview_file_library {
    id: string;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview_file_library;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview_file | null;
}

export interface GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_library;
    preview: GET_VIEWS_LIST_views_list_valuesVersions_treeNode_record_whoAmI_preview | null;
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
    value: any | null;
}

export interface GET_VIEWS_LIST_views_list {
    id: string;
    display: GET_VIEWS_LIST_views_list_display;
    shared: boolean;
    created_by: GET_VIEWS_LIST_views_list_created_by;
    label: any;
    description: any | null;
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
