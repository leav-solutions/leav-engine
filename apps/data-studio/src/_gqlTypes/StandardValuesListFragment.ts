/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: StandardValuesListFragment
// ====================================================

export interface StandardValuesListFragment_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface StandardValuesListFragment_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface StandardValuesListFragment_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues: StandardValuesListFragment_StandardDateRangeValuesListConf_dateRangeValues[] | null;
}

export type StandardValuesListFragment =
    | StandardValuesListFragment_StandardStringValuesListConf
    | StandardValuesListFragment_StandardDateRangeValuesListConf;
