// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const treeNodeChildrenQuery = gql`
    ${recordIdentityFragment}
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            totalCount
            list {
                id
                childrenCount
                record {
                    ...RecordIdentity
                    active: property(attribute: "active") {
                        ... on Value {
                            value
                        }
                    }
                }
                permissions {
                    access_tree
                    detach
                    edit_children
                }
            }
        }
    }
`;
