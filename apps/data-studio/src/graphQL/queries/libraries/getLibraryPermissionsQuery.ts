// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
