// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IItemData} from './types';
import {ExplorerQuery, useExplorerQuery} from '_ui/_gqlTypes';

const _mapping = (data: ExplorerQuery, libraryId: string): IItemData[] =>
    data.records.list.map(({whoAmI, properties}) => ({
        libraryId,
        key: whoAmI.id, // For <KitTable /> only
        itemId: whoAmI.id, // For <KitTable /> only
        whoAmI: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            ...whoAmI
        },
        propertiesById: properties.reduce((acc, {attributeId, values}) => ({...acc, [attributeId]: values}), {})
    }));

export const useExplorerData = (libraryId: string, attributeIds: string[]) => {
    const {data, loading, refetch} = useExplorerQuery({variables: {libraryId, attributeIds}});

    return {
        data: data !== undefined ? _mapping(data, libraryId) : null,
        loading,
        refetch
    };
};
