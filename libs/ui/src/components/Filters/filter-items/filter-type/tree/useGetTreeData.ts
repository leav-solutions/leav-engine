// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {useEffect, useState} from 'react';
import {type GetTreeContentQueryQuery, type GetTreeContentQueryQueryVariables} from '_ui/_gqlTypes';
import {getTreeContentQuery} from '_ui/_queries/trees/getTreeContentQuery';

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

const _toTreeNode = (
    node: GetTreeContentQueryQuery['treeContent'][number] & {
        children?: Array<GetTreeContentQueryQuery['treeContent'][number]>;
    },
): ITreeNode => ({
    title: node.record.whoAmI.label ?? node.record.whoAmI.id,
    id: node.id,
    key: node.id,
    children: (node.children ?? []).map(_toTreeNode),
    accessRecordByDefaultPermission: node.accessRecordByDefaultPermission ?? undefined,
    libraryId: node.record.whoAmI.library.id,
    recordId: node.record.id,
});

export const useGetTreeData = ({treeId, attributeId, libraryId}: IUseGetTreeDataProps) => {
    const [loadTreeContent] = useLazyQuery<GetTreeContentQueryQuery, GetTreeContentQueryQueryVariables>(
        getTreeContentQuery(),
    );

    const [treeData, setTreeData] = useState<ITreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

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
                const {data} = await loadTreeContent({
                    variables: {
                        treeId,
                        accessRecordByDefaultPermission: {
                            attributeId,
                            libraryId,
                        },
                    },
                });

                setTreeData((data?.treeContent ?? []).map(node => _toTreeNode(node)));
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
