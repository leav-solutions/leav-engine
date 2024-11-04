// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveTreeQuery = gql`
    mutation SAVE_TREE($treeData: TreeInput!) {
        saveTree(tree: $treeData) {
            id
            system
            label
            behavior
            libraries {
                library {
                    id
                    label
                    attributes {
                        id
                        label
                        type
                        ... on TreeAttribute {
                            linked_tree {
                                id
                            }
                        }
                    }
                }
                settings {
                    allowMultiplePositions
                    allowedAtRoot
                    allowedChildren
                }
            }
            permissions_conf {
                libraryId
                permissionsConf {
                    permissionTreeAttributes {
                        id
                        label
                    }
                    relation
                }
            }
        }
    }
`;
