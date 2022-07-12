// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getTreeLibraries = (withTotalCount?: boolean) => gql`
    query GET_TREE_LIBRARIES($treeId: ID!) {
        trees(filters: {id: $treeId}) {
            ${withTotalCount ? 'totalCount' : ''}
            list {
                id
                libraries {
                    library {
                        id
                        label
                    }
                }
            }
        }
    }
`;
