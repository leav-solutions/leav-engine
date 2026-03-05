// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

const DEFAULT_DEPTH_TREE_NODES = 10;

/**
 * Generates recursive GraphQL for tree node children.
 * Used to fetch nested children up to the specified depth.
 */
export const treeFiltersTreeNodeChildren = (depth = 0) => `
    children {
        id
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
        accessRecordByDefaultPermission
        ${depth > 0 ? treeFiltersTreeNodeChildren(depth - 1) : ''}
    }
`;

export const treeFiltersDataQuery = (depthTreeNodes = DEFAULT_DEPTH_TREE_NODES) => gql`
    query TreeFiltersDataQuery(
        $treeId: ID!
        $startAt: ID
        $accessRecordByDefaultPermission: AccessRecordByDefaultPermissionInput
    ) {
        treeContent(
            treeId: $treeId
            startAt: $startAt
            accessRecordByDefaultPermission: $accessRecordByDefaultPermission
        ) {
            id
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
            ${treeFiltersTreeNodeChildren(depthTreeNodes - 1)}
            accessRecordByDefaultPermission
        }
    }
`;
