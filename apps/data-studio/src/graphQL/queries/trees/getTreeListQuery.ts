import {gql} from '@apollo/client';

export const getTreeListQuery = gql`
    query GET_TREES($filters: TreesFiltersInput) {
        trees(filters: $filters) {
            list {
                id
                label
                libraries {
                    library {
                        id
                        label
                        behavior
                    }
                }
                behavior
                permissions {
                    access_tree
                    edit_children
                }
            }
        }
    }
`;
