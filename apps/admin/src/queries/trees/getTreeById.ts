import {gql} from '@apollo/client';

export const getTreeByIdQuery = gql`
    query GET_TREE_BY_ID($id: [ID!]) {
        trees(filters: {id: $id}) {
            totalCount
            list {
                id
                label
                system
                behavior
                settings
                permissions_conf {
                    libraryId
                    permissionsConf {
                        permissionTreeAttributes {
                            id
                            label
                            ... on TreeAttribute {
                                linked_tree {
                                    id
                                }
                            }
                        }
                        relation
                    }
                }
                libraries {
                    library {
                        id
                        label
                        attributes {
                            id
                            label
                            type
                        }
                    }
                    settings {
                        allowMultiplePositions
                        allowedAtRoot
                        allowedChildren
                    }
                }
            }
        }
    }
`;
