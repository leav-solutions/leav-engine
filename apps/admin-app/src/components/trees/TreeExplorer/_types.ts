// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FullTree, OnMovePreviousAndNextLocation, OnVisibilityToggleData, TreePath} from 'react-sortable-tree';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {ITreeNode, ITreeNodeData} from '_types/trees';

export type MoveNodeHandler = (moveData: ITreeNodeData & FullTree & OnMovePreviousAndNextLocation) => void;
export type DeleteNodeHandler = (node: ITreeNodeData) => void;
export type ClickNodeHandler = (nodeData: ITreeNodeData) => void;
export type AddTreeElementHandler = (record: RecordIdentity_whoAmI, parent: string, path: string[]) => void;
export type NodeVisibilityToggleHandler = ({expanded, node, path}: OnVisibilityToggleData & TreePath) => void;
export type TreeChangeHandler = (items: ITreeNode[]) => void;
