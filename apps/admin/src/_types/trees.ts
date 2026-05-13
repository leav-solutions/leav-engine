import {type NodeData, type TreeItem} from '@nosferatu500/react-sortable-tree';

export interface ITreeNode extends TreeItem {
    id: string;
}

export interface ITreeNodeData extends NodeData {
    node: ITreeNode;
}

/** NodeData with parentNode - not exported by @nosferatu500/react-sortable-tree */
export type IExtendedTreeNodeData = ITreeNodeData & {
    parentNode?: ITreeNode;
};

export const fakeRootId = 'root';
