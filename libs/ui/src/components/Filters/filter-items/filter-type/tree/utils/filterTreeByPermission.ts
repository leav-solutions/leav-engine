// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ITreeNode} from '../useGetTreeData';

export const filterTreeByPermission = (nodes: ITreeNode[]): ITreeNode[] => {
    const result: ITreeNode[] = [];

    for (const node of nodes) {
        const filteredChildren = filterTreeByPermission(node.children);

        if (node.accessRecordByDefaultPermission || filteredChildren.length > 0) {
            result.push({
                ...node,
                children: filteredChildren,
            });
        }
    }

    return result;
};
