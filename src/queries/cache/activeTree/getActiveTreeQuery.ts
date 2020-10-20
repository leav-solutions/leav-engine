import gql from 'graphql-tag';

export interface IGetActiveTree {
    activeTree?: {
        id: string;
        libraries: {id: string}[];
        label: string;
    };
}

export const getActiveTree = gql`
    query GET_ACTIVE_TREE {
        activeTree @client {
            id @client
            libraries @client
            label @client
        }
    }
`;
