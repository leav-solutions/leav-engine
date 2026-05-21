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
                    value: JSON.stringify({from, to}),
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
            return [{field, condition, value}];
    }
};

const _getBooleanRequestFilters = ({field, condition, value}: IUIFilterStandard): RecordFilterInput[] => {
    if (value === 'false') {
        return [
            {
                field,
                condition: AttributeConditionFilter.NOT_EQUAL,
                value: 'true',
            },
        ];
    }
    return [{field, condition, value}];
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
    const {value, condition} = filter;
    const nodes = isUIFilterTree(filter) ? filter.nodes : undefined;

    if (!value?.length) {
        return [];
    }

    const multiValueOperator =
        condition === RecordFilterCondition.NOT_EQUAL ? RecordFilterOperator.AND : RecordFilterOperator.OR;

    const conditions: RecordFilterInput[] = value.map((recordId, idx) => ({
        value: recordId,
        condition,
        field: nodes?.length
            ? `${filter.attribute.id}.${nodes[0].libraryId}.id`
            : Array.isArray(filter.field)
              ? filter.field[idx]
              : filter.field,
    }));

    if (conditions.length === 1) {
        return conditions;
    }

    return [
        {operator: RecordFilterOperator.OPEN_BRACKET},
        ...interleaveElement(
            {operator: multiValueOperator},
            conditions.map(c => [c]),
        ),
        {operator: RecordFilterOperator.CLOSE_BRACKET},
    ];
};

const _addEmptyCondition = (baseConditions: RecordFilterInput[], filter: UIFilter): RecordFilterInput[] => {
    const hasValue =
        filter.value !== null &&
        filter.value !== undefined &&
        (!Array.isArray(filter.value) || filter.value.length > 0);

    // field can contain multiple entries or be absent — fall back to attribute id
    const field = (Array.isArray(filter.field) ? filter.field[0] : filter.field) || filter.attribute.id;
    const emptyCondition = {
        field,
        condition: RecordFilterCondition.IS_EMPTY,
        value: null,
    };

    if (!hasValue) {
        return [emptyCondition];
    }

    return [
        {operator: RecordFilterOperator.OPEN_BRACKET},
        ...baseConditions,
        {operator: RecordFilterOperator.OR},
        emptyCondition,
        {operator: RecordFilterOperator.CLOSE_BRACKET},
    ];
};

const _applyEmptyValues = (baseConditions: RecordFilterInput[], filter: UIFilter): RecordFilterInput[] =>
    filter.withEmptyValues ? _addEmptyCondition(baseConditions, filter) : baseConditions;

const _filterIsActive = (filter: UIFilter): boolean => {
    if (filter.withEmptyValues) {
        return true;
    }

    if (isUIFilterTree(filter)) {
        // Skip if: (Toggle ON + no user selection) OR (No user selection + no initial value)
        const noUserSelectionNoInitialValue = filter.userNodes == null && (!filter.value || filter.value.length === 0);
        const toggleOnNoUserSelection = filter.includeHiddenOptions && filter.userNodes == null;
        return !(noUserSelectionNoInitialValue || toggleOnNoUserSelection);
    }

    if (isUIFilterWithSmartFilter(filter)) {
        return (
            (filter.value !== null && filter.value.length > 0) ||
            !!(filter.condition && nullValueConditions.includes(filter.condition))
        );
    }

    if (isUIFilterThrough(filter)) {
        return !!(
            filter.subField &&
            filter.subCondition &&
            (filter.value !== null || nullValueConditions.includes(filter.subCondition))
        );
    }

    if (isUIFilterValueList(filter)) {
        return !!(
            (filter.condition && filter.value?.length) ||
            (filter.condition && nullValueConditions.includes(filter.condition))
        );
    }

    return filter.value !== null || !!(filter.condition && nullValueConditions.includes(filter.condition));
};

const _filterToRecordInputs = (filter: UIFilter): RecordFilterInput[] => {
    if (isUIFilterValueList(filter) || isUIFilterTree(filter) || isUIFilterWithSmartFilter(filter)) {
        const field = (Array.isArray(filter.field) ? filter.field[0] : filter.field) || filter.attribute.id;

        if (filter.condition && nullValueConditions.includes(filter.condition)) {
            const baseConditions: RecordFilterInput[] = [
                {
                    field,
                    condition: filter.condition,
                    value: null,
                },
            ];
            return _applyEmptyValues(
                baseConditions,
                filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
            );
        }

        if (isUIFilterTree(filter)) {
            // No user selection (null or undefined): add IS_EMPTY to filters
            // TODO : include IS_EMPTY to permissions
            if (filter.userNodes == null) {
                if (filter.withEmptyValues) {
                    return [{field, condition: RecordFilterCondition.IS_EMPTY, value: null}];
                }
                const baseConditions = _generateConditionsFromMultipleValues(filter as IUIFilterTree);
                return _addEmptyCondition(baseConditions, filter as IUIFilterTree);
            }
        }

        const baseConditions = _generateConditionsFromMultipleValues(
            filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler,
        );
        return _applyEmptyValues(baseConditions, filter as IUIFilterTree | IUIFilterValueList | IUIFilterSmartFiler);
    }

    // Normalize condition and field for THROUGH and link-with-value-list filters
    const condition =
        filter.condition === AttributeConditionFilter.THROUGH
            ? (filter as IUIFilterThrough).subCondition
            : filter.condition;
    let field =
        filter.condition === AttributeConditionFilter.THROUGH
            ? `${filter.field}.${(filter as IUIFilterThrough).subField}`
            : filter.field;

    // When a link attribute has a values list, we must filter on the linked record id
    if (isUIFilterLinkWithValueList(filter) && typeof field === 'string' && !field.endsWith('.id')) {
        field = `${field}.id`;
    }

    if (isUIFilterStandard(filter as UIFilter)) {
        switch ((filter as IUIFilterStandard).attribute.format) {
            case AttributeFormat.date:
                return _getDateRequestFilters({...filter, condition, field} as IUIFilterStandard);
            case AttributeFormat.boolean:
                return _getBooleanRequestFilters({...filter, condition, field} as IUIFilterStandard);
            default:
                break;
        }
    }

    const baseConditions: RecordFilterInput[] = [
        {
            field: field as string,
            condition: condition as RecordFilterCondition,
            value: (filter as IUIFilterStandard | IUIFilterLink | IUIFilterThrough).value,
        },
    ];
    return _applyEmptyValues(baseConditions, filter);
};

export const prepareFiltersForRequest = (
    filters: UIFilter[],
    filtersOperator?: FiltersOperator,
    valuesList?: string[],
): RecordFilterInput[] => {
    const operator = filtersOperator === 'OR' ? RecordFilterOperator.OR : RecordFilterOperator.AND;
    const recordFilters = interleaveElement(
        {operator},
        filters.filter(_filterIsActive).map(_filterToRecordInputs),
    ) as RecordFilterInput[];

    return [
        ...recordFilters,
        ...(recordFilters.length > 0 && valuesList ? [{operator: RecordFilterOperator.AND}] : []),
        ...(valuesList ? _addValuesListForFilters(valuesList) : []),
    ];
};
