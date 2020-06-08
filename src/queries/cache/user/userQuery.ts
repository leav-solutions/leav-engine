import gql from 'graphql-tag';

export const getUser = gql`
    query GET_USER {
        userId @client
        userName @client
        userPermissions @client
    }
`;
