// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAttributeFromKey} from 'utils';
import {IAttribute, IFilter, IQueryFilter} from '_types/types';

export const getFiltersFromRequest = (queryFilters: IQueryFilter[], attributes: IAttribute[]): IFilter[] => {
    let result: IFilter[] = [];

    for (const queryFilter of queryFilters) {
        if (queryFilter.value) {
            const attribute = getAttributeFromKey(queryFilter.field, attributes);
            const filter = {
                index: result.length,
                key: queryFilter.field,
                value: queryFilter.value,
                active: true,
                condition: queryFilter.condition,
                attribute
            };

            result = [...result, filter];
        }
    }

    return result;
};
