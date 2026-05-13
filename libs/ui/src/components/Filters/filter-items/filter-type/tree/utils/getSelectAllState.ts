import {type ITreeNode} from '../useGetTreeData';

export const getSelectAllState = (selectedNodesIds: string[], flattenTree: Map<string, ITreeNode>) => {
    const totalCount = flattenTree.size;

    if (totalCount === 0) {
        return {
            allSelected: false,
            indeterminate: false,
        };
    }

    const selectedCount = selectedNodesIds.filter(id => flattenTree.has(id)).length;
    const allSelected = selectedCount === totalCount;
    const indeterminate = selectedCount > 0 && !allSelected;

    return {
        allSelected,
        indeterminate,
    };
};
