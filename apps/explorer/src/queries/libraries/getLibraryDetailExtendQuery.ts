// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getLibraryDetailExtendedQuery = gql`
    query GET_LIBRARY_DETAIL($libId: ID) {
        libraries(filters: {id: $libId}) {
            list {
                id
                system
                label
                attributes {
                    type
                    format
                    label
                    multiple_values
                    ... on StandardAttribute {
                        id
                    }
                    ... on LinkAttribute {
                        id
                        linked_library
                    }
                    ... on TreeAttribute {
                        id
                        linked_tree
                    }
                }
                gqlNames {
                    query
                    type
                    filter
                    searchableFields
                }
            }
        }
    }
`;
