// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARY_DETAIL
// ====================================================

export interface GET_LIBRARY_DETAIL_libraries_list_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    label: any | null;
}

export interface GET_LIBRARY_DETAIL_libraries_list_linkedTrees {
    id: string;
    label: any | null;
}

export interface GET_LIBRARY_DETAIL_libraries_list {
    id: string;
    system: boolean | null;
    label: any | null;
    attributes: GET_LIBRARY_DETAIL_libraries_list_attributes[] | null;
    linkedTrees: GET_LIBRARY_DETAIL_libraries_list_linkedTrees[] | null;
}

export interface GET_LIBRARY_DETAIL_libraries {
    list: GET_LIBRARY_DETAIL_libraries_list[];
}

export interface GET_LIBRARY_DETAIL {
    libraries: GET_LIBRARY_DETAIL_libraries | null;
}

export interface GET_LIBRARY_DETAILVariables {
    libId?: string | null;
}
