// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type FullTree,
    type OnMovePreviousAndNextLocation,
    type OnVisibilityToggleData,
    type TreePath
} from 'react-sortable-tree';
import {type RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {type ITreeNode, type ITreeNodeData} from '_types/trees';

export type MoveNodeHandler = (moveData: ITreeNodeData & FullTree & OnMovePreviousAndNextLocation) => void;
export type DeleteNodeHandler = (node: ITreeNodeData) => void;
export type ClickNodeHandler = (nodeData: ITreeNodeData) => void;
export type AddTreeElementHandler = (record: RecordIdentity_whoAmI, parent: string, path: string[]) => void;
export type NodeVisibilityToggleHandler = ({expanded, node, path}: OnVisibilityToggleData & TreePath) => void;
export type TreeChangeHandler = (items: ITreeNode[]) => void;
