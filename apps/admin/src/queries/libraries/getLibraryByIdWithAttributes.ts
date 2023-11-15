// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getLibraryByIdWithAttributes = gql`
    query QUERY_LIBRARY_CONFIG($id: [ID!], $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id}) {
            list {
                id
                label(lang: $lang)
                gqlNames {
                    query
                    filter
                }
                attributes {
                    id
                    type
                    format
                    label(lang: $lang)
                }
            }
        }
    }
`;
