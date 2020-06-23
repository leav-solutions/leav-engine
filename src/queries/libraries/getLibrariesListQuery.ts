import gql from 'graphql-tag';

export const getLibrariesListQuery = gql`
    query GET_LIBRARIES_LIST {
        libraries {
            list {
                id
                label
                gqlNames {
                    query
                    filter
                    searchableFields
                }
            }
        }
    }
`;
