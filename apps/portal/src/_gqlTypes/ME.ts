// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: ME_me_whoAmI_library;
    preview: Preview | null;
}

export interface ME_me {
    login: string | null;
    id: string;
    whoAmI: ME_me_whoAmI;
}

export interface ME {
    me: ME_me | null;
}
