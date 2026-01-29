// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';
import {useGetTreeNodeChildrenWithAccessByDefaultPermissionQueryLazyQuery} from '_ui/_gqlTypes';
import {defaultPaginationPageSize} from '_ui/constants';

export interface ITreeNode {
    title: string;
    id: string;
    key: string;
    children: ITreeNode[];
    accessRecordByDefaultPermission?: boolean;
    libraryId: string;
    recordId: string;
}

interface IUseGetTreeDataProps {
    treeId: string;
    attributeId: string;
    libraryId: string;
}

export const useGetTreeData = ({treeId, attributeId, libraryId}: IUseGetTreeDataProps) => {
    const [loadTreeContent] = useGetTreeNodeChildrenWithAccessByDefaultPermissionQueryLazyQuery();
    const [treeData, setTreeData] = useState<ITreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const _fetchChildrenPage = async (parentNodeKey: string | null, offset: number) => {
        const {data} = await loadTreeContent({
            variables: {
                treeId,
                node: parentNodeKey,
                pagination: {offset, limit: defaultPaginationPageSize},
                accessRecordByDefaultPermission: {
                    attributeId,
                    libraryId,
                },
            },
        });

        const {list, totalCount} = data?.treeNodeChildren ?? {list: [], totalCount: 0};

        const nodes = await Promise.all(
            list.map(async node => {
                const children = node.childrenCount ? await _fetchAllChildren(node.id) : [];

                return {
                    title: node.record.whoAmI.label || node.record.whoAmI.id,
                    id: node.id,
                    key: node.id,
                    children,
                    accessRecordByDefaultPermission: node.accessRecordByDefaultPermission,
                    libraryId: node.record.whoAmI.library.id,
                    recordId: node.record.id,
                };
            }),
        );

        return {nodes, totalCount};
    };

    const _fetchAllChildren = async (
        parentNodeKey: string | null,
        offset = 0,
        accumulated: ITreeNode[] = [],
    ): Promise<ITreeNode[]> => {
        const {nodes, totalCount} = await _fetchChildrenPage(parentNodeKey, offset);
        const allNodes = [...accumulated, ...nodes];

        const nextOffset = offset + defaultPaginationPageSize;
        if (nextOffset < totalCount) {
            return _fetchAllChildren(parentNodeKey, nextOffset, allNodes);
        }

        return allNodes;
    };

    useEffect(() => {
        if (!treeId) {
            setTreeData([]);
            setIsLoading(false);
            return;
        }

        const loadTree = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const children = await _fetchAllChildren(null);
                setTreeData(children);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load tree'));
            } finally {
                setIsLoading(false);
            }
        };

        loadTree();
    }, [treeId, attributeId, libraryId]);

    return {treeData, isLoading, error};
};
