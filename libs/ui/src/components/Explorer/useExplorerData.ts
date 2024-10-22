// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDataGroupedFilteredSorted} from './types';
import {ExplorerQuery, useExplorerQuery} from '_ui/_gqlTypes';

const _mapping = (data: ExplorerQuery, libraryId: string): IDataGroupedFilteredSorted<'whoAmI'> =>
    data.records.list.map(({id, whoAmI}) => ({
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
    const {data, loading} = useExplorerQuery({variables: {libraryId}});

    return {
        data: data !== undefined ? _mapping(data, libraryId) : null,
        loading
    };
};
