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
