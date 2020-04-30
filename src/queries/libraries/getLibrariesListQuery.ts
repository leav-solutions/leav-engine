import gql from 'graphql-tag';

export const getLibrariesListQuery = gql`
    query GET_LIBRARY_LIST {
        libraries {
            list {
                id
                label
            }
        }
    }
`;
