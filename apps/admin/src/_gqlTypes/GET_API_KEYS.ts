/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApiKeysFiltersInput, SortApiKeysInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_API_KEYS
// ====================================================

export interface GET_API_KEYS_apiKeys_list_createdBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_API_KEYS_apiKeys_list_createdBy_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_API_KEYS_apiKeys_list_createdBy_whoAmI {
    id: string;
    library: GET_API_KEYS_apiKeys_list_createdBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_API_KEYS_apiKeys_list_createdBy_whoAmI_preview | null;
}

export interface GET_API_KEYS_apiKeys_list_createdBy {
    whoAmI: GET_API_KEYS_apiKeys_list_createdBy_whoAmI;
}

export interface GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI {
    id: string;
    library: GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI_preview | null;
}

export interface GET_API_KEYS_apiKeys_list_modifiedBy {
    whoAmI: GET_API_KEYS_apiKeys_list_modifiedBy_whoAmI;
}

export interface GET_API_KEYS_apiKeys_list_user_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_API_KEYS_apiKeys_list_user_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_API_KEYS_apiKeys_list_user_whoAmI {
    id: string;
    library: GET_API_KEYS_apiKeys_list_user_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_API_KEYS_apiKeys_list_user_whoAmI_preview | null;
}

export interface GET_API_KEYS_apiKeys_list_user {
    whoAmI: GET_API_KEYS_apiKeys_list_user_whoAmI;
}

export interface GET_API_KEYS_apiKeys_list {
    id: string;
    label: string | null;
    key: string | null;
    expiresAt: number | null;
    createdBy: GET_API_KEYS_apiKeys_list_createdBy;
    createdAt: number;
    modifiedBy: GET_API_KEYS_apiKeys_list_modifiedBy;
    modifiedAt: number;
    user: GET_API_KEYS_apiKeys_list_user;
}

export interface GET_API_KEYS_apiKeys {
    list: GET_API_KEYS_apiKeys_list[];
}

export interface GET_API_KEYS {
    apiKeys: GET_API_KEYS_apiKeys;
}

export interface GET_API_KEYSVariables {
    filters?: ApiKeysFiltersInput | null;
    sort?: SortApiKeysInput | null;
}
