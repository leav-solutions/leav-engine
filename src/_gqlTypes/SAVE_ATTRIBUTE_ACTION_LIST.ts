/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE_ACTION_LIST
// ====================================================

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue_params {
    name: string;
    value: string;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue {
    name: string;
    params: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue_params | null)[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue_params {
    name: string;
    value: string;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue {
    name: string;
    params: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue_params | null)[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue_params {
    name: string;
    value: string;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue {
    name: string;
    params: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue_params | null)[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list {
    saveValue: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue | null)[] | null;
    getValue: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue | null)[] | null;
    deleteValue: (SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue | null)[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute {
    id: string;
    actions_list: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST {
    saveAttribute: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute;
}

export interface SAVE_ATTRIBUTE_ACTION_LISTVariables {
    att: AttributeInput;
}
