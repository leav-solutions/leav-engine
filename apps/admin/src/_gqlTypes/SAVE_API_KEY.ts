// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApiKeyInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_API_KEY
// ====================================================

export interface SAVE_API_KEY_saveApiKey_createdBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_API_KEY_saveApiKey_createdBy_whoAmI {
    id: string;
    library: SAVE_API_KEY_saveApiKey_createdBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_API_KEY_saveApiKey_createdBy {
    whoAmI: SAVE_API_KEY_saveApiKey_createdBy_whoAmI;
}

export interface SAVE_API_KEY_saveApiKey_modifiedBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_API_KEY_saveApiKey_modifiedBy_whoAmI {
    id: string;
    library: SAVE_API_KEY_saveApiKey_modifiedBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_API_KEY_saveApiKey_modifiedBy {
    whoAmI: SAVE_API_KEY_saveApiKey_modifiedBy_whoAmI;
}

export interface SAVE_API_KEY_saveApiKey_user_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_API_KEY_saveApiKey_user_whoAmI {
    id: string;
    library: SAVE_API_KEY_saveApiKey_user_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_API_KEY_saveApiKey_user {
    whoAmI: SAVE_API_KEY_saveApiKey_user_whoAmI;
}

export interface SAVE_API_KEY_saveApiKey {
    id: string;
    label: string | null;
    key: string | null;
    expiresAt: number | null;
    createdBy: SAVE_API_KEY_saveApiKey_createdBy;
    createdAt: number;
    modifiedBy: SAVE_API_KEY_saveApiKey_modifiedBy;
    modifiedAt: number;
    user: SAVE_API_KEY_saveApiKey_user;
}

export interface SAVE_API_KEY {
    saveApiKey: SAVE_API_KEY_saveApiKey;
}

export interface SAVE_API_KEYVariables {
    apiKey: ApiKeyInput;
}
