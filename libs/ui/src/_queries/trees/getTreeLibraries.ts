// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getTreeLibraries = gql`
    query GET_TREE_LIBRARIES($treeId: [ID!], $library: String) {
        trees(filters: {id: $treeId, library: $library}) {
            totalCount
            list {
                id
                behavior
                system
                libraries {
                    library {
                        id
                        label
                        behavior
                        system
                    }
                    settings {
                        allowMultiplePositions
                        allowedChildren
                        allowedAtRoot
                    }
                }
            }
        }
    }
`;
