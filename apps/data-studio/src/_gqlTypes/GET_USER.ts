// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_USER
// ====================================================

export interface GET_USER_userWhoAmI_preview_file_library {
    id: string;
}

export interface GET_USER_userWhoAmI_preview_file {
    id: string;
    library: GET_USER_userWhoAmI_preview_file_library;
}

export interface GET_USER_userWhoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: GET_USER_userWhoAmI_preview_file | null;
}

export interface GET_USER_userWhoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_USER_userWhoAmI_library {
    id: string;
    label: any | null;
    gqlNames: GET_USER_userWhoAmI_library_gqlNames;
}

export interface GET_USER_userWhoAmI {
    id: string;
    label: string | null;
    color: string | null;
    preview: GET_USER_userWhoAmI_preview | null;
    library: GET_USER_userWhoAmI_library;
}

export interface GET_USER {
    userId: string;
    userPermissions: string[];
    userWhoAmI: GET_USER_userWhoAmI;
}
