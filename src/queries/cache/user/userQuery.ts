// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
