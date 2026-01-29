// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
