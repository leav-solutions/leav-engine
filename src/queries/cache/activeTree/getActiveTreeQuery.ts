// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
