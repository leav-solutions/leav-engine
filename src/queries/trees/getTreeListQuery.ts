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
