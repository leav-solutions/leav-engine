// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {getQueryFilterField} from 'utils';
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {AttributeConditionFilter, IFilter, IQueryFilter} from '../../../_types/types';

export const getRequestFromFilters = (filters: IFilter[]): IQueryFilter[] => {
    const queryFilters = filters
        .filter(f => f.active && f.value.value !== null)
        .reduce((acc, filter, index) => {
            let queryFilter: IQueryFilter[] = [];

            // TODO: parse /n in text filter to separate entries between OR operators
            if (typeof filter.value.value === 'string' && filter.value.value.match(/\n/g)) {
                console.log('filter.value.value', JSON.stringify(filter.value.value));

                const values = filter.value.value.split('\n').filter(Boolean);

                queryFilter.push({operator: RecordFilterOperator.OPEN_BRACKET});

                for (const v of values) {
                    queryFilter.push({
                        field: filter.condition in AttributeConditionFilter ? getQueryFilterField(filter.key) : null,
                        value: v,
                        condition: RecordFilterCondition[filter.condition]
                    });

                    queryFilter.push({operator: RecordFilterOperator.OR});
                }

                queryFilter.pop(); // delete last OR operator
                queryFilter.push({operator: RecordFilterOperator.CLOSE_BRACKET});
            } else {
                queryFilter = [
                    {
                        field: filter.condition in AttributeConditionFilter ? getQueryFilterField(filter.key) : null,
                        value: filter.value.value.toString(),
                        condition: RecordFilterCondition[filter.condition],
                        treeId: filter.tree?.id
                    }
                ];
            }

            return acc.concat(...queryFilter, {operator: RecordFilterOperator.AND});
        }, [] as IQueryFilter[]);

    queryFilters.pop(); // delete last AND operator

    return queryFilters;
};
