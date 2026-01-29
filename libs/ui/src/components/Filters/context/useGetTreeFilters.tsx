// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type TreeAttributeDetailsFragment,
    useGetLibraryByIdQuery,
    useGetTreeNodeChildrenWithAccessByDefaultPermissionQueryLazyQuery,
} from '_ui/_gqlTypes';
import {useEffect, useState} from 'react';
import {defaultPaginationPageSize} from '_ui/constants';

interface ITreeNode {
    nodeId: string;
    libraryId: string;
    value: string;
    label: string;
}

export interface ITreeFilters {
    [x: string]: ITreeNode[];
}

export const useGetTreeFilters = ({libraryId, skip}: {libraryId: string; skip: boolean}) => {
    const [treeFilters, setTreeFilters] = useState<ITreeFilters>({});
    const [treeFiltersLoading, setTreeFiltersLoading] = useState(true);
    const [loadTreeContent] = useGetTreeNodeChildrenWithAccessByDefaultPermissionQueryLazyQuery();

    const {data: libraryData, loading: libraryLoading} = useGetLibraryByIdQuery({
        variables: {
            id: libraryId,
        },
        skip: skip || !libraryId,
    });

    useEffect(() => {
        if (skip || !libraryId || libraryLoading || !libraryData) {
            return;
        }

        const fetchTreeFilters = async () => {
            const treeAttributesWithExtendedPermissions: Array<{attributeId: string; treeId: string}> =
                libraryData?.libraries.list[0]?.permissions_conf?.permissionTreeAttributes.map(attribute => ({
                    attributeId: attribute.id,
                    treeId: (
                        libraryData?.libraries.list[0]?.attributes.find(
                            tree => tree.id === attribute.id,
                        ) as TreeAttributeDetailsFragment
                    )?.linked_tree?.id,
                })) || [];

            const _fetchChildrenPage = async (
                treeId: string,
                attributeId: string,
                parentNodeKey: string | null,
                offset: number,
            ) => {
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

                const records: ITreeNode[] = [];

                for (const node of list) {
                    if (node.accessRecordByDefaultPermission) {
                        records.push({
                            nodeId: node.id,
                            libraryId: node.record.whoAmI.library.id,
                            value: node.record.id,
                            label: node.record.whoAmI.label,
                        });
                    }

                    if (node.childrenCount > 0) {
                        const childrenRecords = await _fetchAllChildren(treeId, attributeId, node.id);
                        records.push(...childrenRecords);
                    }
                }

                return {records, totalCount};
            };

            const _fetchAllChildren = async (
                treeId: string,
                attributeId: string,
                parentNodeKey: string | null,
                offset = 0,
                accumulated: ITreeNode[] = [],
            ): Promise<ITreeNode[]> => {
                const {records, totalCount} = await _fetchChildrenPage(treeId, attributeId, parentNodeKey, offset);
                const allRecords = [...accumulated, ...records];

                const nextOffset = offset + defaultPaginationPageSize;
                if (nextOffset < totalCount) {
                    return _fetchAllChildren(treeId, attributeId, parentNodeKey, nextOffset, allRecords);
                }

                return allRecords;
            };

            const treeResponse = await Promise.all(
                treeAttributesWithExtendedPermissions.map(async attribute => {
                    const recordIds = await _fetchAllChildren(attribute.treeId, attribute.attributeId, null);

                    return {
                        attributeId: attribute.attributeId,
                        recordIds,
                    };
                }),
            );

            const attributeRecords = treeResponse.reduce((acc, item) => {
                if (item.recordIds.length > 0) {
                    acc[item.attributeId] = item.recordIds;
                }
                return acc;
            }, {});

            setTreeFilters(attributeRecords);
            setTreeFiltersLoading(false);
        };

        fetchTreeFilters();
    }, [skip, libraryId, libraryLoading, libraryData, loadTreeContent]);

    return {
        data: treeFilters,
        loading: treeFiltersLoading,
    };
};
