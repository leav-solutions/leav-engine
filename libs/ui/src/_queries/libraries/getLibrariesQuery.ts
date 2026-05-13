import {gql} from '@apollo/client';

export const getLibrariesQuery = gql`
    fragment LibraryLight on Library {
        id
        label
        icon {
            id
            whoAmI {
                id
                library {
                    id
                }
                preview
            }
        }
    }

    query GET_LIBRARIES {
        libraries {
            list {
                ...LibraryLight
            }
        }
    }
`;
