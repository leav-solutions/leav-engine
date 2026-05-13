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
