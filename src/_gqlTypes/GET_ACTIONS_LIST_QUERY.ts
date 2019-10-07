/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_ACTIONS_LIST_QUERY
// ====================================================

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue {
    name: string;
    is_system: boolean;
    params: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue_params | null)[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue {
    name: string;
    is_system: boolean;
    params: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue_params | null)[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue_params {
    name: string;
    value: string;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue {
    name: string;
    is_system: boolean;
    params: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue_params | null)[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list_actions_list {
    saveValue: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_saveValue | null)[] | null;
    getValue: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_getValue | null)[] | null;
    deleteValue: (GET_ACTIONS_LIST_QUERY_attributes_list_actions_list_deleteValue | null)[] | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes_list {
    id: string;
    actions_list: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list | null;
}

export interface GET_ACTIONS_LIST_QUERY_attributes {
    totalCount: number;
    list: GET_ACTIONS_LIST_QUERY_attributes_list[];
}

export interface GET_ACTIONS_LIST_QUERY {
    attributes: GET_ACTIONS_LIST_QUERY_attributes | null;
}

export interface GET_ACTIONS_LIST_QUERYVariables {
    attId: string;
}
