import {gql} from '@apollo/client';

export const getVersionableAttributesByLibraryQuery = gql`
    query GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY($libraryId: String!) {
        attributes(filters: {libraries: [$libraryId], versionable: true}) {
            list {
                id
                versions_conf {
                    versionable
                    profile {
                        id
                        trees {
                            id
                            label
                        }
                    }
                }
            }
        }
    }
`;
