// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

const DEFAULT_DEPTH_TREE_NODES = 10;

/**
 * Generates recursive GraphQL for tree node children.
 * Used to fetch nested children up to the specified depth.
 */
export const treeContentTreeNodeChildren = (depth = 0) => `
    children {
        id
        childrenCount
        record {
            id
            whoAmI {
                id
                label
                library {
                    id
                }
            }
        }
        ${depth > 0 ? treeContentTreeNodeChildren(depth - 1) : ''}
    }
`;

export const treeContentDataQuery = (depthTreeNodes = DEFAULT_DEPTH_TREE_NODES) => gql`
    query TreeContentDataQuery(
        $treeId: ID!
        $startAt: ID
        $childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput
        $dependentValuesPermissionFilter: DependentValuesPermissionFilterInput
    ) {
        treeContent(
            treeId: $treeId
            startAt: $startAt
            childrenAsRecordValuePermissionFilter: $childrenAsRecordValuePermissionFilter
            dependentValuesPermissionFilter: $dependentValuesPermissionFilter
        ) {
            id
            childrenCount
            record {
                id
                whoAmI {
                    id
                    label
                    library {
                        id
                    }
                }
            }
            ${treeContentTreeNodeChildren(depthTreeNodes - 1)}
        }
    }
`;
