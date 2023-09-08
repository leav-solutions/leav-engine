// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SAVE_USER_DATA
// ====================================================

export interface SAVE_USER_DATA_saveUserData {
    global: boolean;
    data: Any | null;
}

export interface SAVE_USER_DATA {
    saveUserData: SAVE_USER_DATA_saveUserData;
}

export interface SAVE_USER_DATAVariables {
    key: string;
    value?: Any | null;
    global: boolean;
}
