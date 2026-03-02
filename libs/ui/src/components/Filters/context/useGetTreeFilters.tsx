// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {
    type GetTreeContentQueryQuery,
    type GetTreeContentQueryQueryVariables,
    type TreeAttributeDetailsFragment,
    useGetLibraryByIdQuery,
} from '_ui/_gqlTypes';
import {getTreeContentQuery} from '_ui/_queries/trees/getTreeContentQuery';
import {useEffect, useState} from 'react';

interface ITreeNode {
    nodeId: string;
    libraryId: string;
    value: string;
    label: string;
}

export interface ITreeFilters {
    [x: string]: ITreeNode[];
}

const _flattenNodes = (
    nodes: Array<
        GetTreeContentQueryQuery['treeContent'][number] & {
            children?: Array<GetTreeContentQueryQuery['treeContent'][number]>;
        }
    >,
): ITreeNode[] =>
    nodes.flatMap(node => [
        ...(node.accessRecordByDefaultPermission
            ? [
                  {
                      nodeId: node.id,
                      libraryId: node.record.whoAmI.library.id,
                      value: node.record.id,
                      label: node.record.whoAmI.label,
                  },
              ]
            : []),
        ..._flattenNodes(node.children ?? []),
    ]);

export const useGetTreeFilters = ({libraryId, skip}: {libraryId: string; skip: boolean}) => {
    const [treeFilters, setTreeFilters] = useState<ITreeFilters>({});
    const [treeFiltersLoading, setTreeFiltersLoading] = useState(true);
    const [loadTreeContent] = useLazyQuery<GetTreeContentQueryQuery, GetTreeContentQueryQueryVariables>(
        getTreeContentQuery(),
    );

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

            const treeResponse = await Promise.all(
                treeAttributesWithExtendedPermissions.map(async attribute => {
                    const {data} = await loadTreeContent({
                        variables: {
                            treeId: attribute.treeId,
                            accessRecordByDefaultPermission: {
                                attributeId: attribute.attributeId,
                                libraryId,
                            },
                        },
                    });

                    const flatNodes = _flattenNodes(data?.treeContent ?? []);

                    return {
                        attributeId: attribute.attributeId,
                        recordIds: flatNodes,
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
