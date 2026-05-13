import {gql} from '@apollo/client';
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
