import {type ITreeNode} from '../useGetTreeData';

export const countSelectedTreeChildren = (node: ITreeNode, selectedIds: string[]): number => {
    if (!node.children || node.children.length === 0) {
        return 0;
    }
    return node.children.reduce((acc, child) => {
        const isSelected = selectedIds.includes(child.id) ? 1 : 0;
        return acc + isSelected + countSelectedTreeChildren(child, selectedIds);
    }, 0);
};
