import gql from 'graphql-tag';

export const getLibraryDetailExtendsQuery = gql`
    query GET_LIBRARY_DETAIL($libId: ID) {
        libraries(filters: {id: $libId}) {
            list {
                id
                system
                label
                attributes {
                    id
                    type
                    format
                    label
                    multiple_values
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
