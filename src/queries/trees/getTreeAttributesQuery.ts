// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getTreeAttributesQuery = gql`
    query GET_TREE_ATTRIBUTES_QUERY($treeId: ID!) {
        trees(filters: {id: $treeId}) {
            list {
                id
                libraries {
                    id
                    gqlNames {
                        type
                    }
                    attributes {
                        type
                        format
                        label
                        multiple_values
                        ... on StandardAttribute {
                            id
                        }
                        ... on LinkAttribute {
                            id
                            linked_library
                        }
                        ... on TreeAttribute {
                            id
                            linked_tree
                        }
                    }
                }
            }
        }
    }
`;
