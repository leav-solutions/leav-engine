// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_ACTIVE_LIBRARY
// ====================================================

export interface GET_ACTIVE_LIBRARY_activeLib_gql {
    searchableFields: string;
    query: string;
    type: string;
}

export interface GET_ACTIVE_LIBRARY_activeLib {
    id: string;
    name: string;
    filter: string;
    attributes: (any | null)[];
    gql: GET_ACTIVE_LIBRARY_activeLib_gql;
    trees: (string | null)[];
}

export interface GET_ACTIVE_LIBRARY {
    activeLib: GET_ACTIVE_LIBRARY_activeLib | null;
}
