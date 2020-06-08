import gql from 'graphql-tag';

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        activeLibId @client
        activeLibQueryName @client
        activeLibName @client
    }
`;
