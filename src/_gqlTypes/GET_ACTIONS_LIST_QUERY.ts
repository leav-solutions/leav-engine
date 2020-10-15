/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeFormat, IOTypes} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ACTIONS_LIST_QUERY
// ====================================================

export interface GET_ACTIONS_LIST_QUERY_attributes_list_input_types {
    saveValue: IOTypes[];
    getValue: IOTypes[];
    deleteValue: IOTypes[];
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_output_types {
    saveValue: IOTypes[];
    getValue: IOTypes[];
    deleteValue: IOTypes[];
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue {
    id: string;
    is_system: boolean;
    params: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue_params[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue {
    id: string;
    is_system: boolean;
    params: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue_params[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue {
    id: string;
    is_system: boolean;
    params: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue_params[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list {
    saveValue: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue[] | null;
    getValue: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue[] | null;
    deleteValue: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list {
    id: string;
    format: AttributeFormat | null;
    input_types: GET_ACTIONS_LIST_QUERY_attributes_list_input_types;
    output_types: GET_ACTIONS_LIST_QUERY_attributes_list_output_types;
    actions_list: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes {
    list: GET_ACTIONS_LIST_QUERY_attributes_list[];
}

export interface GET_ACTIONS_LIST_QUERY {
    attributes: GET_ACTIONS_LIST_QUERY_attributes | null;
}

export interface GET_ACTIONS_LIST_QUERYVariables {
    attId: string;
}
