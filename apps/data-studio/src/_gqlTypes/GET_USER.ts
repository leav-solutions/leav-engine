// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_USER
// ====================================================

export interface GET_USER_userWhoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_USER_userWhoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
}

export interface GET_USER_userWhoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    preview: Preview | null;
    library: GET_USER_userWhoAmI_library;
}

export interface GET_USER {
    userId: string;
    userPermissions: string[];
    userWhoAmI: GET_USER_userWhoAmI;
}
