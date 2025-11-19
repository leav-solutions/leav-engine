// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type TreeAttributeDetailsFragment,
    useGetLibraryByIdQuery,
    useTreeFilterByDefaultValuesLazyQuery,
} from '_ui/_gqlTypes';
import {useEffect, useState} from 'react';

export interface ITreeFilters {
    [x: string]: Array<{nodeId: string; libraryId: string; value: string; label: string}>;
}

export const useGetTreeFilters = ({libraryId, skip}: {libraryId: string; skip: boolean}) => {
    const [treeFilters, setTreeFilters] = useState<ITreeFilters>({});
    const [treeFiltersLoading, setTreeFiltersLoading] = useState(true);
    const [treeFilterByDefaultValues] = useTreeFilterByDefaultValuesLazyQuery();

    const {data: libraryData, loading: libraryLoading} = useGetLibraryByIdQuery({
        variables: {
            id: libraryId,
        },
        skip: skip || !libraryId,
    });

    useEffect(() => {
        if (skip || !libraryId || libraryLoading) {
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

            const treeResponse = await Promise.all(
                treeAttributesWithExtendedPermissions.map(async attribute => {
                    const res = await treeFilterByDefaultValues({
                        variables: {
                            treeId: attribute.treeId,
                            accessRecordByDefaultPermission: {
                                attributeId: attribute.attributeId,
                                libraryId,
                            },
                        },
                    });

                    return {
                        attributeId: attribute.attributeId,
                        recordIds:
                            res?.data?.treeNodeChildren?.list
                                ?.map(item =>
                                    item.accessRecordByDefaultPermission
                                        ? {
                                              nodeId: item.id,
                                              libraryId: item.record.whoAmI.library.id,
                                              value: item.record.id,
                                              label: item.record.whoAmI.label,
                                          }
                                        : undefined,
                                )
                                .filter(Boolean) || [],
                    };
                }),
            );

            const attributeRecords = treeResponse.reduce((acc, item) => {
                acc[item.attributeId] = item.recordIds;
                return acc;
            }, {});

            setTreeFilters(attributeRecords);
            setTreeFiltersLoading(false);
        };

        fetchTreeFilters();
    }, [skip, libraryId, libraryLoading]);

    return {
        data: treeFilters,
        loading: treeFiltersLoading,
    };
};
