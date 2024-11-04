// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DataGroupedFilteredSorted} from './types';
import {ExplorerQuery, useExplorerQuery} from '_ui/_gqlTypes';

const _mapping = (data: ExplorerQuery, libraryId: string): DataGroupedFilteredSorted<'whoAmI'> =>
    data.records.list.map(({id, whoAmI}) => ({
        key: id,
        libraryId,
        itemId: id,
        value: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            ...whoAmI
        }
    }));

export const useExplorerData = (libraryId: string) => {
    const {data, loading, refetch} = useExplorerQuery({variables: {libraryId}});

    return {
        data: data !== undefined ? _mapping(data, libraryId) : null,
        loading,
        refetch
    };
};
