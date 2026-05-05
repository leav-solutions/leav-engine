// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';
import {type FilterTreeDataQueryQuery} from '_ui/_gqlTypes';
import {filterTreeDataQuery} from './_queries/filterTreeDataQuery';
import {useLazyQuery} from '@apollo/client';

export interface ITreeNode {
    title: string;
    id: string;
    key: string;
    children: ITreeNode[];
    accessRecordByDefaultPermission?: boolean;
    libraryId: string;
    recordId: string;
    disableCheckbox?: boolean;
}

interface IUseGetTreeDataProps {
    treeId: string;
    attributeId: string;
    libraryId: string;
}

const _toTreeNode = (
    node: FilterTreeDataQueryQuery['treeContent'][number] & {
        children?: Array<FilterTreeDataQueryQuery['treeContent'][number]>;
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
    const [loadFilterTreeData] = useLazyQuery(filterTreeDataQuery());

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
                const {data} = await loadFilterTreeData({
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
