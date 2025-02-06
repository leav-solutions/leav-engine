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

const _getDateAtNoon = (date: number): string => dayjs.unix(Number(date)).add(12, 'hour').unix().toString();

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
                return {...filter, condition, field};
            })
            .map(filter => {
                if (isExplorerFilterStandard(filter)) {
                    switch (filter.attribute.format) {
                        case AttributeFormat.date:
                            return _getDateRequestFilters(filter);
                        case AttributeFormat.boolean:
                            return _getBooleanRequestFilters(filter);
                        default:
                            break;
                    }
                }
                return [
                    {
                        field: filter.field,
                        condition: filter.condition,
                        value: filter.value
                    }
                ];
            })
    );
