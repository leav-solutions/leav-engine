import {useQuery} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import {useCallback, useMemo} from 'react';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
    useTreeDataQueryQuery,
} from '_ui/_gqlTypes';
import useLang from '_ui/hooks/useLang/useLang';
import {type IResolvedTreeSelectionConf, type ITreeSelectionNode, type ITreeSelectionNodesById} from './_types';
import {
    DEFAULT_TREE_SELECTION_DEPTH,
    type ITreeSelectionContentData,
    type ITreeSelectionContentNode,
    type ITreeSelectionContentVariables,
    type ITreeSelectionRootNodeData,
    type ITreeSelectionRootNodeVariables,
    treeSelectionContentQuery,
    treeSelectionRootNodeQuery,
} from './_queries/treeSelectionContentQuery';

export interface IUseTreeSelectionNodesParams {
    treeId: string;
    /** Already resolved through `resolveTreeSelectionConf`. */
    conf: IResolvedTreeSelectionConf;
    disabledNodes?: string[];
    /**
     * Restricts the selection to the records of these libraries, all of them by default. A node from
     * another library is disabled rather than silently inert: a `files` tree mixes directories and
     * files under the same bare label, so a file has to *look* like it cannot be picked.
     */
    selectableLibraries?: string[];
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
    /** Holds every request back, for a caller loading the tree only once the user asks for it. */
    skip?: boolean;
    /**
     * Opts out of the Apollo cache for the tree content, so each mount reflects the server. To be
     * enabled by callers whose own flow adds or removes nodes — otherwise a remount silently
     * replays the content read before that change.
     */
    refreshOnMount?: boolean;
    /**
     * Makes the pseudo root node selectable. Off by default: it stands for the tree itself and has
     * no value to store. A caller picking a location rather than a value — where the tree root is
     * a legitimate destination — turns it on.
     */
    canSelectRootNode?: boolean;
}

export interface IUseTreeSelectionNodes {
    /** Pseudo root of the tree, or the `displayRootNode` node when one is configured. */
    rootNode: ITreeSelectionNode | null;
    nodesById: ITreeSelectionNodesById;
    /** Every descendant id of a node, recursively, `nodeId` excluded. */
    getDescendants: (nodeId: string) => string[];
    loading: boolean;
    error?: Error;
}

const _buildNodesById = (root: ITreeSelectionNode): ITreeSelectionNodesById => {
    const nodesById: ITreeSelectionNodesById = {};

    const visit = (node: ITreeSelectionNode) => {
        nodesById[node.id] = node;
        node.children.forEach(visit);
    };

    visit(root);

    return nodesById;
};

/**
 * Loads the content of a tree and turns it into nodes ready to be rendered by `KitTree` or
 * `KitTreeSelect`, with the selection rules of the `IResolvedTreeSelectionConf` already applied.
 */
export const useTreeSelectionNodes = ({
    treeId,
    conf,
    disabledNodes = [],
    selectableLibraries,
    childrenAsRecordValuePermissionFilter,
    dependentValuesPermissionFilter,
    skip = false,
    canSelectRootNode = false,
    refreshOnMount = false,
}: IUseTreeSelectionNodesParams): IUseTreeSelectionNodes => {
    const {lang} = useLang();
    const {selectableNodes, displayRootNode, maxDepth} = conf;

    // Depending on primitives only: the document must be rebuilt on a depth change, and only then
    const contentQuery = useMemo(() => treeSelectionContentQuery(maxDepth ?? DEFAULT_TREE_SELECTION_DEPTH), [maxDepth]);

    const {
        data: contentData,
        loading: contentLoading,
        error: contentError,
    } = useQuery<ITreeSelectionContentData, ITreeSelectionContentVariables>(contentQuery, {
        variables: {
            treeId,
            startAt: displayRootNode,
            childrenAsRecordValuePermissionFilter,
            dependentValuesPermissionFilter,
        },
        // `network-only` rather than `no-cache` for `refreshOnMount`: the response still lands in
        // the cache, so the other trees mounted on the page benefit from the refresh too.
        fetchPolicy: dependentValuesPermissionFilter ? 'no-cache' : refreshOnMount ? 'network-only' : undefined,
        skip,
    });

    // The tree label is only needed to name the pseudo root standing for the whole tree
    const {
        data: treeData,
        loading: treeLoading,
        error: treeError,
    } = useTreeDataQueryQuery({variables: {treeId}, skip: skip || Boolean(displayRootNode)});

    const {
        data: rootNodeData,
        loading: rootNodeLoading,
        error: rootNodeError,
    } = useQuery<ITreeSelectionRootNodeData, ITreeSelectionRootNodeVariables>(treeSelectionRootNodeQuery, {
        variables: {treeId, nodeId: displayRootNode},
        skip: skip || !displayRootNode,
    });

    // Callers pass `disabledNodes` as an inline array: comparing its content keeps the nodes stable
    const disabledNodesKey = disabledNodes.join('|');
    const selectableLibrariesKey = selectableLibraries?.join('|');

    const rootNode = useMemo<ITreeSelectionNode | null>(() => {
        if (!contentData) {
            return null;
        }

        const isSelectable = (nodeId: string, isLeaf: boolean) =>
            !disabledNodes.includes(nodeId) && (selectableNodes === 'all_nodes' || isLeaf);

        const isFromSelectableLibrary = (libraryId: string) =>
            !selectableLibraries || selectableLibraries.includes(libraryId);

        const toNode = (node: ITreeSelectionContentNode, parents: string[]): ITreeSelectionNode => {
            const children = (node.children ?? []).map(child => toNode(child, [node.id, ...parents]));
            const isLeaf = !node.childrenCount;
            const fromSelectableLibrary = isFromSelectableLibrary(node.record.whoAmI.library.id);
            const selectable = isSelectable(node.id, isLeaf) && fromSelectableLibrary;

            return {
                id: node.id,
                key: node.id,
                title: node.record.whoAmI.label || node.record.whoAmI.id,
                record: node.record,
                isLeaf,
                children,
                parents,
                disabled: disabledNodes.includes(node.id) || !fromSelectableLibrary,
                selectable,
                checkable: selectable,
                libraryBehavior: node.record.whoAmI.library.behavior,
            };
        };

        if (displayRootNode) {
            const rootRecord = rootNodeData?.getRecordByNodeId;

            if (!rootRecord) {
                return null;
            }

            const children = contentData.treeContent.map(node => toNode(node, [displayRootNode]));
            const fromSelectableLibrary = isFromSelectableLibrary(rootRecord.whoAmI.library.id);
            const selectable = isSelectable(displayRootNode, children.length === 0) && fromSelectableLibrary;

            return {
                id: displayRootNode,
                key: displayRootNode,
                title: rootRecord.whoAmI.label || rootRecord.whoAmI.id,
                record: rootRecord,
                isLeaf: children.length === 0,
                children,
                parents: [],
                disabled: disabledNodes.includes(displayRootNode) || !fromSelectableLibrary,
                selectable,
                checkable: selectable,
                libraryBehavior: rootRecord.whoAmI.library.behavior,
            };
        }

        // The pseudo root stands for the tree itself, not for a node: there is nothing to store
        // unless the caller is picking a location, in which case it means "at the root of the tree"
        const selectable = canSelectRootNode && isSelectable(treeId, false);

        return {
            id: treeId,
            key: treeId,
            title: localizedTranslation(treeData?.trees?.list[0]?.label, lang) || treeId,
            record: null,
            isLeaf: false,
            children: contentData.treeContent.map(node => toNode(node, [treeId])),
            parents: [],
            disabled: false,
            selectable,
            checkable: selectable,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        contentData,
        rootNodeData,
        treeData,
        treeId,
        displayRootNode,
        selectableNodes,
        disabledNodesKey,
        selectableLibrariesKey,
        lang,
        canSelectRootNode,
    ]);

    const nodesById = useMemo(() => (rootNode ? _buildNodesById(rootNode) : {}), [rootNode]);

    const getDescendants = useCallback(
        (nodeId: string): string[] => {
            const collect = (id: string): string[] =>
                (nodesById[id]?.children ?? []).reduce<string[]>(
                    (descendants, child) => [...descendants, child.id, ...collect(child.id)],
                    [],
                );

            return collect(nodeId);
        },
        [nodesById],
    );

    return {
        rootNode,
        nodesById,
        getDescendants,
        loading: contentLoading || treeLoading || rootNodeLoading,
        error: contentError ?? treeError ?? rootNodeError,
    };
};
