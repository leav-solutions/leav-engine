/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {ValueVersionInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_RECORD_DATA
// ====================================================

export interface GET_RECORD_DATA_record_list_price {
    id_value: string | null;
    value: string | null;
    raw_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: any | null;
}

export interface GET_RECORD_DATA_record_list {
    id: string;
    price: GET_RECORD_DATA_record_list_price | null;
}

export interface GET_RECORD_DATA_record {
    list: GET_RECORD_DATA_record_list[];
}

export interface GET_RECORD_DATA {
    record: GET_RECORD_DATA_record;
}

export interface GET_RECORD_DATAVariables {
    id: string;
    version?: (ValueVersionInput | null)[] | null;
}
