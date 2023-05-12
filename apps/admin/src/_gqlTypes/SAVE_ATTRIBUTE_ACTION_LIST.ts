// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
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
    id: string;
    params: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue_params[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue_params {
    name: string;
    value: string;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue {
    id: string;
    params: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue_params[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue_params {
    name: string;
    value: string;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue {
    id: string;
    params: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue_params[] | null;
}

export interface SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list {
    saveValue: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_saveValue[] | null;
    getValue: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_getValue[] | null;
    deleteValue: SAVE_ATTRIBUTE_ACTION_LIST_saveAttribute_actions_list_deleteValue[] | null;
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
