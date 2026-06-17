/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ME
// ====================================================

export interface ME_me_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ME_me_whoAmI {
    id: string;
    library: ME_me_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ME_me {
    login: string | null;
    whoAmI: ME_me_whoAmI;
}

export interface ME {
    me: ME_me | null;
}
