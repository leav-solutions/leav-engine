/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREES
// ====================================================

export interface GET_TREES_trees_list_libraries {
    id: string;
    label: any | null;
}

export interface GET_TREES_trees_list {
    id: string;
    label: any | null;
    system: boolean;
    libraries: GET_TREES_trees_list_libraries[];
}

export interface GET_TREES_trees {
    totalCount: number;
    list: GET_TREES_trees_list[];
}

export interface GET_TREES {
    trees: GET_TREES_trees | null;
}

export interface GET_TREESVariables {
    id?: string | null;
    label?: string | null;
    system?: boolean | null;
    lang?: AvailableLanguage[] | null;
}
