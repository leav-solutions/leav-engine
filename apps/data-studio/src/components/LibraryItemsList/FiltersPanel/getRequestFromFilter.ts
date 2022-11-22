// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {
    AttributeConditionFilter,
    IFilter,
    IFilterTree,
    IQueryFilter,
    ThroughConditionFilter
} from '../../../_types/types';

export const getRequestFromFilters = (filters: IFilter[]): IQueryFilter[] => {
    const queryFilters = filters
        .filter(f => f.active)
        .reduce((acc, filter) => {
            let queryFilter: IQueryFilter[] = [];
            const conditionToApply =
                filter.condition === ThroughConditionFilter.THROUGH ? AttributeConditionFilter.EQUAL : filter.condition;

            if (filter.value === null) {
                queryFilter = [
                    {
                        field: conditionToApply in AttributeConditionFilter ? filter.key : null,
                        condition: RecordFilterCondition[conditionToApply],
                        treeId: (filter as IFilterTree).tree?.id
                    }
                ];
            } else if (typeof filter.value.value === 'string' && filter.value.value.match(/\n/g)) {
                const values = filter.value.value.split('\n').filter(Boolean);

                queryFilter.push({operator: RecordFilterOperator.OPEN_BRACKET});

                for (const v of values) {
                    queryFilter.push({
                        field: conditionToApply in AttributeConditionFilter ? filter.key : null,
                        value: v,
                        condition: RecordFilterCondition[conditionToApply]
                    });

                    queryFilter.push({operator: RecordFilterOperator.OR});
                }

                queryFilter.pop(); // delete last OR operator
                queryFilter.push({operator: RecordFilterOperator.CLOSE_BRACKET});
            } else {
                queryFilter = [
                    {
                        field: filter?.condition in AttributeConditionFilter ? filter.key : null,
                        value:
                            filter?.condition === AttributeConditionFilter.BETWEEN
                                ? JSON.stringify(filter?.value?.value ?? '')
                                : (filter?.value?.value ?? '').toString(),
                        condition: RecordFilterCondition[filter?.condition],
                        treeId: (filter as IFilterTree).tree?.id
                    }
                ];
            }

            return acc.concat(...queryFilter, {operator: RecordFilterOperator.AND});
        }, [] as IQueryFilter[]);

    queryFilters.pop(); // delete last AND operator

    return queryFilters;
};
