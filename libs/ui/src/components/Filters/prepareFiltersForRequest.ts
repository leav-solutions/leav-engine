// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import {AttributeFormat, RecordFilterCondition, type RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {AttributeConditionFilter} from '_ui/types';
import {
    type UIFilter,
    type IUIFilterLink,
    type IUIFilterStandard,
    type IUIFilterThrough,
    type IUIFilterTree,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    type IUIFilterValueList,
    type FiltersOperator,
    isUIFilterLinkWithValueList,
    isUIFilterWithSmartFilter,
    type IUIFilterSmartFiler,
} from './_types';
import {nullValueConditions} from './conditionsHelper';

export const dateValuesSeparator = '\n';

const _getDateAtNoon = (date: number): string => dayjs.unix(Number(date)).add(12, 'hour').unix().toString();

const _getDateRequestFilters = ({field, condition, value}: IUIFilterStandard): RecordFilterInput[] => {
    switch (condition) {
        case RecordFilterCondition.BETWEEN:
            const [from, to] = value!.split(dateValuesSeparator);
            return [
                {
                    field,
                    condition,
                    value: JSON.stringify({
                        from,
                        to,
                    }),
                },
            ];
        case RecordFilterCondition.NOT_EQUAL:
            return [
                {
                    field,
                    condition: RecordFilterCondition.NOT_EQUAL,
                    value: _getDateAtNoon(Number(value)),
                },
            ];
        case RecordFilterCondition.EQUAL:
            return [
                {
                    field,
                    condition,
                    value: _getDateAtNoon(Number(value)),
                },
            ];
        default:
            return [
                {
                    field,
                    condition,
                    value,
                },
            ];
    }
};

const _getBooleanRequestFilters = (filter: IUIFilterStandard): RecordFilterInput[] => {
    if (filter.value === 'false') {
        return [
            {
                field: filter.field,
                condition: AttributeConditionFilter.NOT_EQUAL,
                value: 'true',
            },
        ];
    }

    return [{field: filter.field, condition: filter.condition, value: filter.value}];
};

const _addValuesListForFilters = (valuesList: string[]): RecordFilterInput[] => [
    {operator: RecordFilterOperator.OPEN_BRACKET},
    ...(interleaveElement(
        {operator: RecordFilterOperator.OR},
        valuesList.map(value => [
            {
                field: 'id',
                condition: AttributeConditionFilter.EQUAL,
                value,
            },
        ]),
    ) as RecordFilterInput[]),
    {operator: RecordFilterOperator.CLOSE_BRACKET},
];

const _generateConditionsFromMultipleValues = (
    filter: IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
): RecordFilterInput[] => {
    if (!filter.value || filter.value.length === 0) {
        return [];
    }
    const filtersWithOperators: RecordFilterInput[] = [];
    filter.value.forEach((recordId, idx) => {
        if (idx === 0 && filter.value && filter.value.length > 1) {
            filtersWithOperators.push({operator: RecordFilterOperator.OPEN_BRACKET});
        }
        if (isUIFilterTree(filter) && filter.nodes && filter.nodes.length > 0) {
            filtersWithOperators.push({
                value: recordId,
                condition: filter.condition,
                field: `${filter.attribute.id}.${filter.nodes[0].libraryId}.id`,
            });
        } else {
            filtersWithOperators.push({
                value: recordId,
                condition: filter.condition,
                field: Array.isArray(filter.field) ? filter.field[idx] : filter.field,
            });
        }
        if (filter.value && idx < filter.value.length - 1) {
            filtersWithOperators.push({
                operator:
                    filter.condition === RecordFilterCondition.NOT_EQUAL
                        ? RecordFilterOperator.AND
                        : RecordFilterOperator.OR,
            });
        }
        if (filter.value && filter.value.length > 1 && idx >= filter.value.length - 1) {
            filtersWithOperators.push({operator: RecordFilterOperator.CLOSE_BRACKET});
        }
    });
    return filtersWithOperators;
};

const _addEmptyCondition = (baseConditions: RecordFilterInput[], filter: UIFilter): RecordFilterInput[] => {
    if (!filter.withEmptyValues) {
        return baseConditions;
    }

    const hasValue =
        filter.value !== null &&
        filter.value !== undefined &&
        (!Array.isArray(filter.value) || filter.value.length > 0);

    // patch because field contains multiple informations & can be empty
    const field = (Array.isArray(filter.field) ? filter.field[0] : filter.field) || filter.attribute.id;
    const emptyCondition = {
        field,
        condition: RecordFilterCondition.IS_EMPTY,
        value: null,
    };

    if (!hasValue) {
        return [emptyCondition];
    } else {
        return [
            {operator: RecordFilterOperator.OPEN_BRACKET},
            ...baseConditions,
            {operator: RecordFilterOperator.OR},
            emptyCondition,
            {operator: RecordFilterOperator.CLOSE_BRACKET},
        ];
    }
};

export const prepareFiltersForRequest = (
    filters: UIFilter[],
    filtersOperator?: FiltersOperator,
    valuesList?: string[],
): RecordFilterInput[] => {
    const interleaveFilter = interleaveElement(
        {operator: filtersOperator === 'OR' ? RecordFilterOperator.OR : RecordFilterOperator.AND},
        filters
            .filter(filter => {
                if (filter.withEmptyValues) {
                    return true;
                }

                if (isUIFilterWithSmartFilter(filter)) {
                    return (
                        (filter.value !== null && filter.value.length > 0) ||
                        (filter.condition && nullValueConditions.includes(filter.condition))
                    );
                }

                if (isUIFilterThrough(filter)) {
                    return (
                        filter.subField &&
                        filter.subCondition &&
                        (filter.value !== null || nullValueConditions.includes(filter.subCondition))
                    );
                }

                if (isUIFilterValueList(filter)) {
                    return (
                        (!!filter.condition && filter.value?.length) ||
                        (filter.condition && nullValueConditions.includes(filter.condition))
                    );
                }

                return filter.value !== null || (filter.condition && nullValueConditions.includes(filter.condition));
            })
            .map(filter => {
                if (isUIFilterTree(filter)) {
                    return filter;
                }
                const condition =
                    filter.condition === AttributeConditionFilter.THROUGH ? filter.subCondition : filter.condition;
                let field =
                    filter.condition === AttributeConditionFilter.THROUGH
                        ? `${filter.field}.${filter.subField}`
                        : filter.field;

                // When a link attribute has a values list, we must filter on the linked record id
                if (isUIFilterLinkWithValueList(filter) && typeof field === 'string' && !field.endsWith('.id')) {
                    field = `${field}.id`;
                }

                return {...filter, condition, field};
            })
            .map(filter => {
                //@ts-ignore typscript does not recognize filter as a UIFilter
                if (isUIFilterValueList(filter) || isUIFilterTree(filter) || isUIFilterWithSmartFilter(filter)) {
                    if (filter.condition && nullValueConditions.includes(filter.condition)) {
                        const baseConditions = [
                            {
                                field: Array.isArray(filter.field) ? filter.field[0] : filter.field,
                                condition: filter.condition,
                                value: null,
                            },
                        ];
                        return _addEmptyCondition(
                            baseConditions,
                            filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
                        );
                    }
                    const baseConditions = _generateConditionsFromMultipleValues(
                        filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
                    );
                    return _addEmptyCondition(
                        baseConditions,
                        filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
                    );
                }

                if (isUIFilterStandard(filter as UIFilter)) {
                    switch (filter.attribute.format) {
                        case AttributeFormat.date:
                            return _getDateRequestFilters(filter as IUIFilterStandard);
                        case AttributeFormat.boolean:
                            return _getBooleanRequestFilters(filter as IUIFilterStandard);
                        default:
                            break;
                    }
                }
                const filterWithStringValue = filter as IUIFilterStandard | IUIFilterLink | IUIFilterThrough;
                const baseConditions: RecordFilterInput[] = [
                    {
                        field: filterWithStringValue.field as string,
                        condition: filterWithStringValue.condition as RecordFilterCondition,
                        value: filterWithStringValue.value,
                    },
                ];
                return _addEmptyCondition(baseConditions, filter as UIFilter);
            }),
    );

    return [
        ...interleaveFilter,
        ...(interleaveFilter.length > 0 && valuesList ? [{operator: RecordFilterOperator.AND}] : []),
        ...(valuesList ? _addValuesListForFilters(valuesList) : []),
    ];
};
