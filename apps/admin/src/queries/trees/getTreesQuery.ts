import {gql} from '@apollo/client';

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
