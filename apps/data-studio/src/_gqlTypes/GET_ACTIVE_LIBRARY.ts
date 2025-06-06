// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ACTIVE_LIBRARY
// ====================================================

export interface GET_ACTIVE_LIBRARY_activeLib_gql {
    searchableFields: string;
    query: string;
    type: string;
}

export interface GET_ACTIVE_LIBRARY_activeLib_permissions {
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface GET_ACTIVE_LIBRARY_activeLib {
    id: string;
    name: string;
    filter: string;
    behavior: LibraryBehavior;
    attributes: (Any | null)[];
    gql: GET_ACTIVE_LIBRARY_activeLib_gql;
    trees: (string | null)[];
    permissions: GET_ACTIVE_LIBRARY_activeLib_permissions;
}

export interface GET_ACTIVE_LIBRARY {
    activeLib: GET_ACTIVE_LIBRARY_activeLib | null;
}
