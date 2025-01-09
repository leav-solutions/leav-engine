// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import {AttributeFormat, RecordFilterCondition, RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {AttributeConditionFilter} from '_ui/types';
import {IExplorerFilter} from '../_types';
import {nullValueConditions} from '../conditionsHelper';

export const dateValuesSeparator = '\n';

const _getDateRequestFilters = ({
    field,
    condition,
    value
}: Pick<IExplorerFilter, 'field' | 'value' | 'condition'>): RecordFilterInput[] => {
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

const _getBooleanRequestFilters = ({
    field,
    condition,
    value
}: Pick<IExplorerFilter, 'field' | 'value' | 'condition'>): RecordFilterInput[] => {
    if (value === 'false') {
        return [
            {
                field,
                condition: AttributeConditionFilter.NOT_EQUAL,
                value: 'true'
            }
        ];
    }

    return [{field, condition, value}];
};

export const prepareFiltersForRequest = (filters: IExplorerFilter[]): RecordFilterInput[] =>
    interleaveElement(
        {operator: RecordFilterOperator.AND},
        filters
            .filter(({value, condition}) => value !== null || nullValueConditions.includes(condition ?? ''))
            .map(({attribute, field, condition, value}) => {
                switch (attribute.format) {
                    case AttributeFormat.date:
                        return _getDateRequestFilters({field, condition, value});
                    case AttributeFormat.boolean:
                        return _getBooleanRequestFilters({field, condition, value});
                    default:
                        return [
                            {
                                field,
                                condition,
                                value
                            }
                        ];
                }
            })
    );
