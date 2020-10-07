import gql from 'graphql-tag';

export interface IGetActiveLibrary {
    activeLib: {
        id: string;
        name: string;
        filter: string;
        gql: {
            query: string;
            type: string;
        };
    };
}

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        activeLib @client {
            id @client
            name @client
            filter @client
            gql @client {
                query @client
                type @client
            }
        }
    }
`;
