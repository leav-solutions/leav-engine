import {gql} from '@apollo/client';

export const getLibraryPreviewsSettingsQuery = gql`
    query GET_LIBRARY_PREVIEWS_SETTINGS($id: ID!) {
        libraries(filters: {id: [$id]}) {
            list {
                id
                label
                behavior
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
            }
        }
    }
`;
