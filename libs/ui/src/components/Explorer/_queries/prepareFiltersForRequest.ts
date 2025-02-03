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

const _getDateAtNoon = (date: number): string => dayjs.unix(Number(date)).add(12, 'hour').unix().toString();

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
                    condition: RecordFilterCondition.NOT_EQUAL,
                    value: _getDateAtNoon(Number(value))
                }
            ];
        case RecordFilterCondition.EQUAL:
            return [
                {
                    field,
                    condition,
                    value: _getDateAtNoon(Number(value))
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
