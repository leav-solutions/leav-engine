// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ITreeNode} from '../useGetTreeData';

export const buildFlattenTree = (nodes: ITreeNode[]): Map<string, ITreeNode> => {
    const treeMap = new Map<string, ITreeNode>();

    const _buildFlattenTreeRecursive = (nodeList: ITreeNode[]) => {
        for (const node of nodeList) {
            treeMap.set(node.id, node);

            if (node.children && node.children.length > 0) {
                _buildFlattenTreeRecursive(node.children);
            }
        }
    };

    _buildFlattenTreeRecursive(nodes);

    return treeMap;
};
