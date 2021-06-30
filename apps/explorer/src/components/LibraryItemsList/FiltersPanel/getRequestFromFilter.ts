// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {getQueryFilterField} from 'utils';
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {IFilter, IQueryFilter, AttributeConditionFilter} from '../../../_types/types';

export const getRequestFromFilters = (filters: IFilter[]): IQueryFilter[] => {
    const queryFilters = filters
        .filter(f => f.active)
        .reduce((acc, filter, index) => {
            const queryFilter: IQueryFilter = {
                field: filter.condition in AttributeConditionFilter ? getQueryFilterField(filter.key) : null,
                value: filter.value.value ? filter.value.value.toString() : null,
                condition: RecordFilterCondition[filter.condition],
                treeId: filter.tree?.id
            };

            return acc.concat(queryFilter, {operator: RecordFilterOperator.AND});
        }, [] as IQueryFilter[]);

    queryFilters.pop(); // delete last AND operator

    return queryFilters;
};
