import gql from 'graphql-tag';

export interface IGetUser {
    userId: string;
    userName: string;
    userPermissions: any;
}

export const getUser = gql`
    query GET_USER {
        userId @client
        userName @client
        userPermissions @client
    }
`;
