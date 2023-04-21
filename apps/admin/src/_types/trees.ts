// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExtendedNodeData, NodeData, TreeItem} from 'react-sortable-tree';

export interface ITreeNode extends TreeItem {
    id: string;
}

export interface ITreeNodeData extends NodeData {
    node: ITreeNode;
}

export type IExtendedTreeNodeData = ExtendedNodeData &
    ITreeNodeData & {
        parentNode: ITreeNode;
    };

export const fakeRootId = 'root';
