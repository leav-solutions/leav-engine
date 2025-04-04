// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

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
