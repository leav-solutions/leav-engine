import gql from 'graphql-tag';

export interface IActiveTree {
    id: string;
    libraries: {id: string}[];
    label: string;
}

export interface IGetActiveTree {
    activeTree?: IActiveTree;
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
