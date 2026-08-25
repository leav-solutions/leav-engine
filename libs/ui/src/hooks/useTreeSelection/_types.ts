import {type LibraryBehavior} from '_ui/_gqlTypes';
import {type ITreeNodeWithRecord} from '_ui/types';

export type TreeSelectableNodes = 'all_nodes' | 'leaves_only';

/** Every field is present: defaults have already been applied by `resolveTreeSelectionConf`. */
export interface IResolvedTreeSelectionConf {
    selectableNodes: TreeSelectableNodes;
    defaultExpanded: boolean;
    displayRootNode: string | null;
    maxDepth: number | null;
    showSelectChildrenButton: boolean;
    showSelectDescendantsButton: boolean;
}

export interface ITreeSelectionNode extends ITreeNodeWithRecord {
    key: string; // = id, required by KitTree / KitTreeSelect
    isLeaf: boolean;
    children: ITreeSelectionNode[];
    parents: string[]; // from the closest one to the root
    disabled: boolean;
    selectable: boolean; // false when leaves_only and the node is not a leaf
    /**
     * Mirrors `selectable`: on antd `Tree`, `selectable: false` prevents selection by click but
     * *not* checking in `checkable` mode, which needs `DataNode.checkable`.
     */
    checkable: boolean;
    /** Absent on the pseudo root, which stands for the tree itself and belongs to no library. */
    libraryBehavior?: LibraryBehavior;
}

export interface ITreeSelectionNodesById {
    [nodeId: string]: ITreeSelectionNode;
}
