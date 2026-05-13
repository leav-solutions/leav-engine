import {gql} from '@apollo/client';

export const getLibraryPermissionsQuery = gql`
    query GET_LIBRARY_PERMISSIONS($libraryId: [ID!]) {
        libraries(filters: {id: $libraryId}) {
            list {
                permissions {
                    access_library
                    access_record
                    create_record
                    edit_record
                    delete_record
                }
            }
        }
    }
`;
