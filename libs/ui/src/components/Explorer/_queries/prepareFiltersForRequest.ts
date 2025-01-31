// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import {AttributeFormat, RecordFilterCondition, RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {AttributeConditionFilter} from '_ui/types';
import {ExplorerFilter, IExplorerFilterStandard, isExplorerFilterStandard, isExplorerFilterThrough} from '../_types';
import {nullValueConditions} from '../conditionsHelper';

export const dateValuesSeparator = '\n';

const _getDateRequestFilters = ({field, condition, value}: IExplorerFilterStandard): RecordFilterInput[] => {
    switch (condition) {
        case RecordFilterCondition.BETWEEN:
            const [from, to] = value!.split(dateValuesSeparator);
            return [
                {
                    field,
                    condition,
                    value: JSON.stringify({
                        from,
                        to
                    })
                }
            ];
        case RecordFilterCondition.NOT_EQUAL:
            return [
                {
                    field,
                    condition: RecordFilterCondition.LESS_THAN,
                    value: dayjs.unix(Number(value)).startOf('day').unix().toString()
                },
                {operator: RecordFilterOperator.OR},
                {
                    field,
                    condition: RecordFilterCondition.GREATER_THAN,
                    value: dayjs.unix(Number(value)).endOf('day').unix().toString()
                },
                {operator: RecordFilterOperator.OR},
                {
                    field,
                    condition: RecordFilterCondition.IS_EMPTY,
                    value: null
                }
            ];
        case RecordFilterCondition.EQUAL:
            return [
                {
                    field,
                    condition: RecordFilterCondition.BETWEEN,
                    value: JSON.stringify({
                        from: dayjs.unix(Number(value)).startOf('day').unix().toString(),
                        to: dayjs.unix(Number(value)).endOf('day').unix().toString()
                    })
                }
            ];
        default:
            return [
                {
                    field,
                    condition,
                    value
                }
            ];
    }
};

const _getBooleanRequestFilters = (filter: IExplorerFilterStandard): RecordFilterInput[] => {
    if (filter.value === 'false') {
        return [
            {
                field: filter.field,
                condition: AttributeConditionFilter.NOT_EQUAL,
                value: 'true'
            }
        ];
    }

    return [{field: filter.field, condition: filter.condition, value: filter.value}];
};

export const prepareFiltersForRequest = (filters: ExplorerFilter[]): RecordFilterInput[] =>
    interleaveElement(
        {operator: RecordFilterOperator.AND},
        filters
            .filter(filter => {
                if (isExplorerFilterThrough(filter)) {
                    return (
                        filter.subField &&
                        filter.subCondition &&
                        (filter.value !== null || nullValueConditions.includes(filter.subCondition))
                    );
                }

                return filter.value !== null || (filter.condition && nullValueConditions.includes(filter.condition));
            })
            .map(filter => {
                const condition =
                    filter.condition === AttributeConditionFilter.THROUGH ? filter.subCondition : filter.condition;
                const field =
                    filter.condition === AttributeConditionFilter.THROUGH
                        ? `${filter.field}.${filter.subField}`
                        : filter.field;
                const filterConcat: ExplorerFilter = {...filter, condition, field};

                if (isExplorerFilterStandard(filterConcat)) {
                    switch (filterConcat.attribute.format) {
                        case AttributeFormat.date:
                            return _getDateRequestFilters(filterConcat);
                        case AttributeFormat.boolean:
                            return _getBooleanRequestFilters(filterConcat);
                        default:
                            break;
                    }
                }
                return [
                    {
                        field: filterConcat.field,
                        condition: filterConcat.condition,
                        value: filterConcat.value
                    }
                ] as RecordFilterInput[];
            })
    );
