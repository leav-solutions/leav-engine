import gql from 'graphql-tag';

export const getTreeByIdQuery = gql`
    query GET_TREE_BY_ID($id: ID, $lang: [AvailableLanguage!]) {
        trees(filters: {id: $id}) {
            totalCount
            list {
                id
                label(lang: $lang)
                system
                behavior
                permissions_conf {
                    libraryId
                    permissionsConf {
                        permissionTreeAttributes {
                            id
                            label
                            ... on TreeAttribute {
                                linked_tree
                            }
                        }
                        relation
                    }
                }
                libraries {
                    id
                    label
                    attributes {
                        id
                        label
                        type
                    }
                }
            }
        }
    }
`;
