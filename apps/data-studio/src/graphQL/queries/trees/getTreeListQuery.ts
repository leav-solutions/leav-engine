// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

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
