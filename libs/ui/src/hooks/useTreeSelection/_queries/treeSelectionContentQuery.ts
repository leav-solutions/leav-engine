import {gql} from '@apollo/client';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
} from '_ui/_gqlTypes';

/** Same default as `DEFAULT_DEPTH_TREE_NODES` of the V1 query: deeper nodes are not fetched. */
export const DEFAULT_TREE_SELECTION_DEPTH = 10;

const NODE_FRAGMENT = `
    fragment TreeSelectionContentNode on TreeNode {
        id
        childrenCount
        record {
            id
            whoAmI {
                id
                label
                # Part of the RecordIdentity cache key, see cacheTypePolicies
                library {
                    id
                }
            }
        }
    }
`;

/**
 * GraphQL fragments cannot recurse, so the `children` nesting has to be spelled out. Built from the
 * innermost level outwards, `depth` times.
 */
const _nestChildren = (depth: number): string => {
    let selection = '';

    for (let level = 0; level < depth; level++) {
        selection = `children { ...TreeSelectionContentNode ${selection} }`;
    }

    return selection;
};

/**
 * Built at runtime — hence typed by hand below: graphql-codegen strips interpolated selections, so a
 * generated document would silently drop every `children` level.
 *
 * ⚠️ A different document is produced for each depth: callers must memoize it, otherwise Apollo sees
 * a new query on every render, bypasses its cache and loops.
 */
export const treeSelectionContentQuery = (depth = DEFAULT_TREE_SELECTION_DEPTH) => gql`
    ${NODE_FRAGMENT}
    query TreeSelectionContent(
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
            ...TreeSelectionContentNode
            ${_nestChildren(depth - 1)}
        }
    }
`;

/**
 * `treeContent(startAt:)` returns the *children* of the node, never the node itself: when
 * `displayRootNode` is configured, its own record is fetched apart to build the pseudo root.
 */
export const treeSelectionRootNodeQuery = gql`
    query TreeSelectionRootNode($treeId: ID!, $nodeId: ID!) {
        getRecordByNodeId(treeId: $treeId, nodeId: $nodeId) {
            id
            whoAmI {
                id
                label
                library {
                    id
                }
            }
        }
    }
`;

export interface ITreeSelectionContentRecord {
    id: string;
    whoAmI: {id: string; label?: string | null; library: {id: string}};
}

export interface ITreeSelectionContentNode {
    id: string;
    childrenCount?: number | null;
    record: ITreeSelectionContentRecord;
    children?: ITreeSelectionContentNode[] | null;
}

export interface ITreeSelectionContentData {
    treeContent: ITreeSelectionContentNode[];
}

export interface ITreeSelectionContentVariables {
    treeId: string;
    startAt?: string | null;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
}

export interface ITreeSelectionRootNodeData {
    getRecordByNodeId: ITreeSelectionContentRecord;
}

export interface ITreeSelectionRootNodeVariables {
    treeId: string;
    nodeId: string;
}
