// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';

export interface IActiveLibrary {
    id: string;
    name: string;
    filter: string;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[];
    gql: {
        searchableFields: string;
        query: string;
        type: string;
    };
    trees: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[];
}

export interface IGetActiveLibrary {
    activeLib: IActiveLibrary;
}

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        activeLib @client {
            id @client
            name @client
            filter @client
            attributes @client
            gql @client {
                searchableFields @client
                query @client
                type @client
            }
            trees
        }
    }
`;
