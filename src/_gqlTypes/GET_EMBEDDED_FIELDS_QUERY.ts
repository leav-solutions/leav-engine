/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_EMBEDDED_FIELDS_QUERY
// ====================================================

export interface GET_EMBEDDED_FIELDS_QUERY_attributes_list {
    id: string;
    label: any | null;
    format: AttributeFormat | null;
}

export interface GET_EMBEDDED_FIELDS_QUERY_attributes {
    list: GET_EMBEDDED_FIELDS_QUERY_attributes_list[];
}

export interface GET_EMBEDDED_FIELDS_QUERY {
    attributes: GET_EMBEDDED_FIELDS_QUERY_attributes | null;
}

export interface GET_EMBEDDED_FIELDS_QUERYVariables {
    attId: string;
}
