// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export interface IActiveTree {
    id: string;
    libraries: Array<{id: string}>;
    label: string;
    permissions: {
        access_tree: boolean;
        edit_children: boolean;
    };
}

export interface IGetActiveTree {
    activeTree?: IActiveTree;
}

export const getActiveTree = gql`
    query GET_ACTIVE_TREE {
        activeTree @client {
            id @client
            libraries @client {
                id @client
            }
            label @client
            permissions @client {
                access_tree @client
                edit_children @client
            }
        }
    }
`;
