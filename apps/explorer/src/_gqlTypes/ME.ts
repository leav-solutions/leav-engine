// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ME
// ====================================================

export interface ME_me_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ME_me_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: ME_me_whoAmI_library_gqlNames;
}

export interface ME_me_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pages: string | null;
}

export interface ME_me_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ME_me_whoAmI_library;
    preview: ME_me_whoAmI_preview | null;
}

export interface ME_me {
    login: string | null;
    id: string;
    whoAmI: ME_me_whoAmI;
}

export interface ME {
    me: ME_me | null;
}
