import {gql} from '@apollo/client';

export const getLibrariesWithAttributesQuery = gql`
    query GET_LIBRARIES_WITH_ATTRIBUTES {
        libraries {
            totalCount
            list {
                id
                label
                attributes {
                    id
                    label
                }
            }
        }
    }
`;
