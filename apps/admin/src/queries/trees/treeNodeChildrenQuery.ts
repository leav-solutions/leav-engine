// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const getTreeNodeChildrenQuery = gql`
    ${recordIdentityFragment}
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            list {
                id
                order
                childrenCount
                record {
                    ...RecordIdentity
                }
                ancestors {
                    id
                    record {
                        id
                        library {
                            id
                            label
                        }
                        ...RecordIdentity
                    }
                }
            }
        }
    }
`;
