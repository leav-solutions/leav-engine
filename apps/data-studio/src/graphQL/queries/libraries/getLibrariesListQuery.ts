// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getLibrariesListQuery = gql`
    ${recordIdentityFragment}
    query GET_LIBRARIES_LIST {
        libraries {
            list {
                id
                label
                behavior
                icon {
                    ...RecordIdentity
                }
                gqlNames {
                    query
                    filter
                    searchableFields
                }
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
