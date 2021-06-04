// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {getQueryFilterField} from 'utils';
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {IFilter, IQueryFilter} from '../../../_types/types';

export const getRequestFromFilters = (filters: IFilter[]): IQueryFilter[] => {
    const queryFilters = filters.reduce((acc, filter, index) => {
        const field = getQueryFilterField(filter.key);

        const queryFilter: IQueryFilter = {
            field,
            value: filter.value?.toString(),
            condition: filter.condition as RecordFilterCondition
        };

        if (index !== filters.length - 1) {
            const operator: IQueryFilter = {
                operator: RecordFilterOperator.AND
            };

            return [...acc, queryFilter, operator];
        }

        return [...acc, queryFilter];
    }, [] as IQueryFilter[]);

    return queryFilters;
};
