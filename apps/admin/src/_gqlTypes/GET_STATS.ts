// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_STATS
// ====================================================

export interface GET_STATS_libraries {
    totalCount: number;
}

export interface GET_STATS_attributes {
    totalCount: number;
}

export interface GET_STATS_trees {
    totalCount: number;
}

export interface GET_STATS_applications {
    totalCount: number;
}

export interface GET_STATS {
    libraries: GET_STATS_libraries | null;
    attributes: GET_STATS_attributes | null;
    trees: GET_STATS_trees | null;
    applications: GET_STATS_applications | null;
}
