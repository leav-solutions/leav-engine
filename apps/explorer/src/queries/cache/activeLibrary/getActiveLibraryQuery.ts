// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export interface IActiveLibrary {
    id: string;
    name: string;
    filter: string;
    gql: {
        searchableFields: string;
        query: string;
        type: string;
    };
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
            gql @client {
                searchableFields @client
                query @client
                type @client
            }
        }
    }
`;
