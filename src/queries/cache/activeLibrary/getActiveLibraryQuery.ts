import gql from 'graphql-tag';

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        id @client
        queryName @client
        name @client
    }
`;
