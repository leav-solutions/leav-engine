import {gql} from '@apollo/client';

export const getLibraryByIdWithAttributes = gql`
    query QUERY_LIBRARY_CONFIG($id: [ID!], $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id}) {
            list {
                id
                label(lang: $lang)
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
