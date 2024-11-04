// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {LibraryBehavior} from '_gqlTypes/globalTypes';

export interface IActiveLibrary {
    id: string;
    name: string;
    behavior: LibraryBehavior;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[];
    trees: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[];
    permissions: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions;
}

export interface IGetActiveLibrary {
    activeLib: IActiveLibrary;
}

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        activeLib @client {
            id @client
            name @client
            behavior @client
            attributes @client
            trees
            permissions @client {
                access_library @client
                access_record @client
                create_record @client
                edit_record @client
                delete_record @client
            }
        }
    }
`;
