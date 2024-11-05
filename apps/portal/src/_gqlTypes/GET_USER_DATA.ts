// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_USER_DATA
// ====================================================

export interface GET_USER_DATA_userData {
    global: boolean;
    data: Any | null;
}

export interface GET_USER_DATA {
    userData: GET_USER_DATA_userData;
}

export interface GET_USER_DATAVariables {
    keys: string[];
    global?: boolean | null;
}
