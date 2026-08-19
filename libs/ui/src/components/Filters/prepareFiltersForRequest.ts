import dayjs from 'dayjs';
import {AttributeFormat, RecordFilterCondition, type RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {AttributeConditionFilter} from '_ui/types';
import {
    type UIFilter,
    type IUIFilterStandard,
    type IUIFilterTree,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    type IUIFilterValueList,
    type FiltersOperator,
    isUIFilterLinkWithValueList,
    isUIFilterLinkWithSmartFilter,
    isUIFilterWithSmartFilter,
    type IUIFilterSmartFilter,
} from './_types';
import {nullValueConditions} from './conditionsHelper';

export const dateValuesSeparator = '\n';

const _getDateAtNoon = (date: number): string => dayjs.unix(Number(date)).add(12, 'hour').unix().toString();

const _getDateRequestFilters = ({field, condition, value}: IUIFilterStandard): RecordFilterInput[] => {
    switch (condition) {
        case RecordFilterCondition.BETWEEN: {
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
        }
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
    ...interleaveElement<RecordFilterInput, RecordFilterInput>(
        {operator: RecordFilterOperator.OR},
        valuesList.map(value => [
            {
                field: 'id',
                condition: AttributeConditionFilter.EQUAL,
                value,
            },
        ]),
    ),
    {operator: RecordFilterOperator.CLOSE_BRACKET},
];

const _generateConditionsFromMultipleValues = (
    filter: IUIFilterTree | IUIFilterValueList | IUIFilterSmartFilter,
): RecordFilterInput[] => {
    // `value` is contractually `string[]` for tree / values-list / smart filters, but a smart filter on a
    // link/standard attribute can be seeded (toUIFilters) with a scalar string. Normalize so we never call
    // `.forEach` on a non-array (would throw "value.forEach is not a function").
    const value = Array.isArray(filter.value) ? filter.value : filter.value == null ? [] : [filter.value];
    const nodes = isUIFilterTree(filter) ? filter.nodes : undefined;

    if (value.length === 0) {
        return [];
    }
    const filtersWithOperators: RecordFilterInput[] = [];
    value.forEach((recordId, idx) => {
        if (idx === 0 && value.length > 1) {
            filtersWithOperators.push({operator: RecordFilterOperator.OPEN_BRACKET});
        }
        if (nodes?.length > 0) {
            filtersWithOperators.push({
                value: recordId,
                condition: filter.condition,
                field: `${filter.attribute.id}.${nodes[0].libraryId}.id`,
            });
        } else {
            filtersWithOperators.push({
                value: recordId,
                condition: filter.condition,
                field: Array.isArray(filter.field) ? filter.field[idx] : filter.field,
            });
        }
        if (idx < value.length - 1) {
            filtersWithOperators.push({
                operator:
                    filter.condition === RecordFilterCondition.NOT_EQUAL
                        ? RecordFilterOperator.AND
                        : RecordFilterOperator.OR,
            });
        }
        if (value.length > 1 && idx >= value.length - 1) {
            filtersWithOperators.push({operator: RecordFilterOperator.CLOSE_BRACKET});
        }
    });
    return filtersWithOperators;
};

const _addEmptyCondition = (baseConditions: RecordFilterInput[], filter: UIFilter): RecordFilterInput[] => {
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

/**
 * Whether a filter carries enough information to be sent to the request.
 * Each filter kind has its own "emptiness" rule (multi-value selection, through sub-fields…).
 */
const shouldIncludeFilter = (filter: UIFilter): boolean => {
    if (filter.withEmptyValues) {
        return true;
    }
    if (isUIFilterTree(filter)) {
        // Skip if: (no effective record id to filter on) OR (Toggle ON + no user selection).
        // "No effective value" covers both an untouched tree (`userNodes == null`) and an
        // EXPLICITLY cleared one (`userNodes: []`, value `[]`): a tree with no record ids can't
        // filter anything. A tree with `withEmptyValues` already returned true above, so
        // "Non défini" still applies.
        const noEffectiveValue = !filter.value || filter.value.length === 0;
        const toggleOnNoUserSelection = filter.includeHiddenOptions && filter.userNodes == null;
        return !(noEffectiveValue || toggleOnNoUserSelection);
    }
    if (isUIFilterWithSmartFilter(filter)) {
        return Boolean(
            (filter.value !== null && filter.value.length > 0) ||
            (filter.condition && nullValueConditions.includes(filter.condition)),
        );
    }
    if (isUIFilterThrough(filter)) {
        return Boolean(
            filter.subField &&
            filter.subCondition &&
            (filter.value !== null || nullValueConditions.includes(filter.subCondition)),
        );
    }
    if (isUIFilterValueList(filter)) {
        return Boolean(
            (!!filter.condition && filter.value?.length) ||
            (filter.condition && nullValueConditions.includes(filter.condition)),
        );
    }
    return Boolean(filter.value !== null || (filter.condition && nullValueConditions.includes(filter.condition)));
};

/**
 * Normalizes field/condition before serialization:
 *  - THROUGH filters collapse `field` + `subField` into `field.subField` and use the subCondition,
 *  - link filters backed by a values list must target the linked record id (`field.id`).
 * Trees are returned untouched (their field is an array, handled by the serializer).
 */
const normalizeFilterField = (filter: UIFilter): UIFilter => {
    if (isUIFilterTree(filter)) {
        return filter;
    }
    const condition = isUIFilterThrough(filter) ? filter.subCondition : filter.condition;
    let field = isUIFilterThrough(filter) ? `${filter.field}.${filter.subField}` : filter.field;

    // A smart filter with a `through` reaches its values on a sub-attribute of the linked
    // record, so the query must target `<attribute>.<through>.id` (e.g.
    // campaigns_structure_items.structure_items_thematic.id). `through` is attribute metadata,
    // so we derive the path from it — correct whether the stored filter kept the through
    // segment (reclassified as a through filter) or dropped it (a plain link smart filter).
    // This mirrors the addFilter reducer, which builds the same path for a freshly-added filter.
    if (isUIFilterWithSmartFilter(filter) && filter.attribute.smartFilter?.through) {
        field = `${filter.attribute.id}.${filter.attribute.smartFilter.through.id}.id`;
    } else if (
        // A link values-list / through-less smart filter → the value is the linked record id,
        // so filter on `<field>.id` (a bare link field filters on the record's identity, not
        // its id — returning nothing). addFilter appends `.id` on add, but a ViewV2 round-trip
        // strips it (the stored path drops `.id` segments), so we re-apply it here.
        (isUIFilterLinkWithValueList(filter) || isUIFilterLinkWithSmartFilter(filter)) &&
        typeof field === 'string' &&
        !field.endsWith('.id')
    ) {
        field = `${field}.id`;
    }

    const normalizedFilter = {...filter, condition, field};
    return normalizedFilter as UIFilter;
};

/**
 * Serializes a single (already field-normalized) filter into the request conditions it represents.
 * Multi-value kinds (tree, value list, smart filter) expand into bracketed OR/AND groups;
 * single-value kinds map to one condition (with date/boolean special-casing).
 */
const serializeFilter = (filter: UIFilter): RecordFilterInput[] => {
    if (isUIFilterValueList(filter) || isUIFilterTree(filter) || isUIFilterWithSmartFilter(filter)) {
        const field = (Array.isArray(filter.field) ? filter.field[0] : filter.field) || filter.attribute.id;
        if (filter.condition && nullValueConditions.includes(filter.condition)) {
            const baseConditions: RecordFilterInput[] = [{field, condition: filter.condition, value: null}];
            return !filter.withEmptyValues ? baseConditions : _addEmptyCondition(baseConditions, filter);
        }
        if (isUIFilterTree(filter)) {
            // No user selection (null or undefined): add IS_EMPTY to filters
            // TODO : include IS_EMPTY to permissions
            if (filter.userNodes == null) {
                if (filter.withEmptyValues) {
                    return [{field, condition: RecordFilterCondition.IS_EMPTY, value: null}];
                }
                const baseConditions = _generateConditionsFromMultipleValues(filter);
                return _addEmptyCondition(baseConditions, filter);
            }
        }
        const baseConditions = _generateConditionsFromMultipleValues(filter);
        return !filter.withEmptyValues ? baseConditions : _addEmptyCondition(baseConditions, filter);
    }

    if (isUIFilterStandard(filter)) {
        switch (filter.attribute.format) {
            case AttributeFormat.date:
                return _getDateRequestFilters(filter);
            case AttributeFormat.boolean:
                return _getBooleanRequestFilters(filter);
            default:
                break;
        }
    }

    const baseConditions: RecordFilterInput[] = [
        {
            field: filter.field,
            condition: filter.condition as RecordFilterCondition,
            value: filter.value,
        },
    ];
    return !filter.withEmptyValues ? baseConditions : _addEmptyCondition(baseConditions, filter);
};

export const prepareFiltersForRequest = (
    filters: UIFilter[],
    filtersOperator?: FiltersOperator,
    valuesList?: string[],
): RecordFilterInput[] => {
    const serializedFilters = filters.filter(shouldIncludeFilter).map(normalizeFilterField).map(serializeFilter);

    const interleaveFilter = interleaveElement(
        {operator: filtersOperator === 'OR' ? RecordFilterOperator.OR : RecordFilterOperator.AND},
        serializedFilters,
    );

    return [
        ...interleaveFilter,
        ...(interleaveFilter.length > 0 && valuesList ? [{operator: RecordFilterOperator.AND}] : []),
        ...(valuesList ? _addValuesListForFilters(valuesList) : []),
    ];
};
