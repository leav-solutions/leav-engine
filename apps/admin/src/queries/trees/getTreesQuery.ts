// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getTreesQueryName = 'GET_TREES';

export const getTreesQuery = gql`
    query GET_TREES($filters: TreesFiltersInput) {
        trees(filters: $filters) {
            totalCount
            list {
                id
                label
                system
                behavior
                libraries {
                    library {
                        id
                        label
                    }
                    settings {
                        allowMultiplePositions
                        allowedAtRoot
                        allowedChildren
                    }
                }
            }
        }
    }
`;
