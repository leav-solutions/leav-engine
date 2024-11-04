// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
