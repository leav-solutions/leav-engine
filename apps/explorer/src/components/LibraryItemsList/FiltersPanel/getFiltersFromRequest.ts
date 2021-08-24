// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAttributeFromKey} from 'utils';
import {IAttribute, IFilter, IQueryFilter} from '_types/types';

export const getFiltersFromRequest = (
    queryFilters: IQueryFilter[],
    library: string,
    attributes: IAttribute[]
): IFilter[] => {
    let filters: IFilter[] = [];

    for (const queryFilter of queryFilters) {
        if (queryFilter.value) {
            const attribute = getAttributeFromKey(queryFilter.field, library, attributes);
            const filter = {
                index: filters.length,
                key: queryFilter.field,
                value: {value: queryFilter.value},
                active: true,
                condition: queryFilter.condition,
                attribute,
                treeId: queryFilter.treeId
            };

            filters = [...filters, filter];
        }
    }

    return filters;
};
