// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ViewSizes, ViewTypes, RecordFilterCondition, RecordFilterOperator, SortOrder} from './globalTypes';

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
    label: any | null;
}

export interface ViewDetails_filters {
    field: string | null;
    value: string | null;
    tree: ViewDetails_filters_tree | null;
    condition: RecordFilterCondition | null;
    operator: RecordFilterOperator | null;
}

export interface ViewDetails_sort {
    field: string | null;
    order: SortOrder;
}

export interface ViewDetails_settings {
    name: string;
    value: any | null;
}

export interface ViewDetails {
    id: string;
    display: ViewDetails_display;
    shared: boolean;
    created_by: ViewDetails_created_by;
    label: any;
    description: any | null;
    color: string | null;
    filters: ViewDetails_filters[] | null;
    sort: ViewDetails_sort | null;
    settings: ViewDetails_settings[] | null;
}
