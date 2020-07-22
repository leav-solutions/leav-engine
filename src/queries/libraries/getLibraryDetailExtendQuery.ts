import gql from 'graphql-tag';

export const getLibraryDetailExtendsQuery = gql`
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
                    filter
                    searchableFields
                }
            }
        }
    }
`;
