// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

export const getTreeNodeChildrenQuery = gql`
    ${recordIdentityFragment}

    fragment TreeNodeChild on TreeNodeLight {
        id
        order
        childrenCount
        record {
            ...RecordIdentity
            active: property(attribute: "active") {
                ... on Value {
                    value
                }
            }
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
        permissions {
            access_tree
            detach
            edit_children
        }
    }

    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            totalCount
            list {
                ...TreeNodeChild
            }
        }
    }
`;
