// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
