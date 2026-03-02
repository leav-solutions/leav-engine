// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {recordIdentityFragment} from '../../gqlFragments';
import {gql} from '@apollo/client';

const DEFAULT_DEPTH_TREE_NODES = 10;

/**
 * Generates recursive GraphQL for tree node children.
 * Used to fetch nested children up to the specified depth.
 */
export const getTreeNodeChildren = (depth = 0) => `
    children {
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
        permissions {
            access_tree
            detach
            edit_children
        }
        accessRecordByDefaultPermission
        ${depth > 0 ? getTreeNodeChildren(depth - 1) : ''}
    }
`;

export const getTreeContentQuery = (depthTreeNodes = DEFAULT_DEPTH_TREE_NODES) => gql`
    ${recordIdentityFragment}
    query GetTreeContentQuery(
        $treeId: ID!
        $startAt: ID
        $childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput
        $dependentValuesPermissionFilter: DependentValuesPermissionFilterInput
        $accessRecordByDefaultPermission: AccessRecordByDefaultPermissionInput
    ) {
        treeContent(
            treeId: $treeId
            startAt: $startAt
            childrenAsRecordValuePermissionFilter: $childrenAsRecordValuePermissionFilter
            dependentValuesPermissionFilter: $dependentValuesPermissionFilter
            accessRecordByDefaultPermission: $accessRecordByDefaultPermission
        ) {
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
            ${getTreeNodeChildren(depthTreeNodes - 1)}
            permissions {
                access_tree
                detach
                edit_children
            }
            accessRecordByDefaultPermission
        }
    }
`;
