// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {ILabel} from '../../_types/types';

export interface IGetTreeListQuery {
    trees: {
        list: [
            {
                id: string;
                label: ILabel;
                libraries: {
                    id: string;
                    label: ILabel;
                }[];
            }
        ];
    };
}

export interface IGetTreeListQueryVar {
    treeId: string;
}

export const getTreeListQuery = gql`
    query GET_TREE_LIST_QUERY($treeId: ID) {
        trees(filters: {id: $treeId}) {
            list {
                id
                label
                libraries {
                    id
                    label
                }
            }
        }
    }
`;
