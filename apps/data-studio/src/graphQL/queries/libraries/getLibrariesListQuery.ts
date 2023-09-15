// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getLibrariesListQuery = gql`
    ${recordIdentityFragment}
    query GET_LIBRARIES_LIST($filters: LibrariesFiltersInput) {
        libraries(filters: $filters) {
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
                previewsSettings {
                    description
                    label
                    system
                    versions {
                        background
                        density
                        sizes {
                            name
                            size
                        }
                    }
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
