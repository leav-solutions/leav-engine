// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type TreeItem} from '@nosferatu500/react-sortable-tree';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {type ITreeNode, type ITreeNodeData} from '../../../_types/trees';

/** Compatible with OnMoveNodeParams from @nosferatu500/react-sortable-tree */
export type OnMoveNodeParams = {
    treeData: unknown[];
    node: TreeItem;
    nextParentNode: TreeItem | null;
    prevPath: number[];
    prevTreeIndex: number;
    nextPath: number[];
    nextTreeIndex: number;
};

/** Compatible with OnVisibilityToggleParams from @nosferatu500/react-sortable-tree */
export type OnVisibilityToggleData = {
    expanded: boolean;
    node: TreeItem;
    path: number[];
};

export type MoveNodeHandler = (moveData: OnMoveNodeParams) => void;
export type DeleteNodeHandler = (node: ITreeNodeData) => void;
export type ClickNodeHandler = (nodeData: ITreeNodeData) => void;
export type AddTreeElementHandler = (record: RecordIdentity_whoAmI, parent: string, path: string[]) => void;
export type NodeVisibilityToggleHandler = (params: OnVisibilityToggleData) => void;
export type TreeChangeHandler = (items: ITreeNode[]) => void;
