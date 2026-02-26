// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
