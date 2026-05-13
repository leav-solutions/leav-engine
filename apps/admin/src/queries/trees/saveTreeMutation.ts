import {gql} from '@apollo/client';

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
            settings
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
