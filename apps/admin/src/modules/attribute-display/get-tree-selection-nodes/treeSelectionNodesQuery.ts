import {gql} from '@apollo/client';

/** Same default as `DEFAULT_DEPTH_TREE_NODES` in libs/ui: nodes deeper than that cannot be picked. */
export const TREE_SELECTION_NODES_MAX_DEPTH = 10;

const NODE_FRAGMENT = `
    fragment TreeSelectionNodeInfo on TreeNode {
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
 * innermost level outwards, `depth` times, instead of being written by hand in a .graphql file.
 */
const _nestChildren = (depth: number): string => {
    let selection = '';

    for (let level = 0; level < depth; level++) {
        selection = `children { ...TreeSelectionNodeInfo ${selection} }`;
    }

    return selection;
};

/**
 * Built at runtime, hence typed by hand: graphql-codegen strips interpolated selections, so a
 * generated document would silently drop every `children` level (same reason as in libs/ui).
 */
export const treeSelectionNodesQuery = (depth = TREE_SELECTION_NODES_MAX_DEPTH) => gql`
    ${NODE_FRAGMENT}
    query getTreeSelectionNodes($treeId: ID!) {
        treeContent(treeId: $treeId) {
            ...TreeSelectionNodeInfo
            ${_nestChildren(depth - 1)}
        }
    }
`;

export interface ITreeSelectionNode {
    id: string;
    childrenCount?: number | null;
    record: {id: string; whoAmI: {id: string; label?: string | null; library: {id: string}}};
    children?: ITreeSelectionNode[] | null;
}

export interface ITreeSelectionNodesQueryData {
    treeContent: ITreeSelectionNode[];
}

export interface ITreeSelectionNodesQueryVariables {
    treeId: string;
}
