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
                    behavior
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
                        behavior
                    }
                }
            }
            ${treeContentTreeNodeChildren(depthTreeNodes - 1)}
        }
    }
`;
