// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_TREE, SAVE_TREEVariables} from '../../_gqlTypes/SAVE_TREE';

export const SaveTreeMutation = p => Mutation<SAVE_TREE, SAVE_TREEVariables>(p);

export const saveTreeQuery = gql`
    mutation SAVE_TREE($treeData: TreeInput!) {
        saveTree(tree: $treeData) {
            id
            system
            label
            behavior
            libraries {
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
