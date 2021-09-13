// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ViewTypes, RecordFilterCondition, RecordFilterOperator, SortOrder} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_VIEW
// ====================================================

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

export interface GET_VIEW_view_filters {
    field: string | null;
    value: string | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface GET_VIEW_view_sort {
    field: string | null;
    order: SortOrder;
}

export interface GET_VIEW_view_settings {
    name: string;
    value: any | null;
}

export interface GET_VIEW_view {
    id: string;
    type: ViewTypes;
    shared: boolean;
    created_by: GET_VIEW_view_created_by;
    label: any;
    description: any | null;
    color: string | null;
    filters: GET_VIEW_view_filters[] | null;
    sort: GET_VIEW_view_sort | null;
    settings: GET_VIEW_view_settings[] | null;
}

export interface GET_VIEW_view {
    view: GET_VIEW_view;
}

export interface GET_VIEW {
    views: GET_VIEW_view | null;
}

export interface GET_VIEWVariables {
    viewId: string;
}
