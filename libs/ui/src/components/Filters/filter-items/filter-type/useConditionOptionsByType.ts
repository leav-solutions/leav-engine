// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, type RecordFilterCondition} from '_ui/_gqlTypes';
import {AttributeConditionFilter, type AttributeConditionType, type ThroughConditionFilter} from '_ui/types';
import {type TFunction} from 'i18next';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    isUIFilterLink,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    type UIFilter,
} from '../../_types';

export const conditionsByFormat: Record<AttributeFormat, RecordFilterCondition[]> = {
    [AttributeFormat.text]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.BEGIN_WITH,
        AttributeConditionFilter.END_WITH,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
    ],
    [AttributeFormat.rich_text]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
    ],
    [AttributeFormat.boolean]: [],
    [AttributeFormat.date]: [
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.GREATER_THAN,
        AttributeConditionFilter.LESS_THAN,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
        AttributeConditionFilter.TODAY,
        AttributeConditionFilter.TOMORROW,
        AttributeConditionFilter.YESTERDAY,
        AttributeConditionFilter.LAST_MONTH,
        AttributeConditionFilter.NEXT_MONTH,
        AttributeConditionFilter.BETWEEN,
    ],
    [AttributeFormat.date_range]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.encrypted]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.extended]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.color]: [],
    [AttributeFormat.numeric]: [
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
        AttributeConditionFilter.LESS_THAN,
        AttributeConditionFilter.GREATER_THAN,
    ],
};

export const linkFilterConditions: Array<RecordFilterCondition | ThroughConditionFilter> = [
    // disable NOT_EQUAL for now because of backend condition filter issue
    ...conditionsByFormat[AttributeFormat.text].filter(f => f !== AttributeConditionFilter.NOT_EQUAL),
    AttributeConditionFilter.THROUGH,
];
export const treeFilterConditions: RecordFilterCondition[] = [AttributeConditionFilter.EQUAL];
export const valueListTextConditions: RecordFilterCondition[] = [AttributeConditionFilter.EQUAL];

interface IUIFilterConditionOption<T> {
    label: string;
    value: T;
    textByFormat?: {[key in AttributeFormat]?: string};
}

export const getAttributeConditionOptions = (t: TFunction): Array<IUIFilterConditionOption<AttributeConditionType>> => [
    {label: t('filters.contains'), value: AttributeConditionFilter.CONTAINS},
    {label: t('filters.not-contains'), value: AttributeConditionFilter.NOT_CONTAINS},
    {label: t('filters.equal'), value: AttributeConditionFilter.EQUAL},
    {label: t('filters.not-equal'), value: AttributeConditionFilter.NOT_EQUAL},
    {label: t('filters.begin-with'), value: AttributeConditionFilter.BEGIN_WITH},
    {label: t('filters.end-with'), value: AttributeConditionFilter.END_WITH},
    {
        label: t('filters.less-than'),
        textByFormat: {[AttributeFormat.date]: String(t('filters.before'))},
        value: AttributeConditionFilter.LESS_THAN,
    },
    {
        label: t('filters.greater-than'),
        textByFormat: {[AttributeFormat.date]: String(t('filters.after'))},
        value: AttributeConditionFilter.GREATER_THAN,
    },
    {label: t('filters.today'), value: AttributeConditionFilter.TODAY},
    {label: t('filters.tomorrow'), value: AttributeConditionFilter.TOMORROW},
    {label: t('filters.yesterday'), value: AttributeConditionFilter.YESTERDAY},
    {label: t('filters.last-month'), value: AttributeConditionFilter.LAST_MONTH},
    {label: t('filters.next-month'), value: AttributeConditionFilter.NEXT_MONTH},
    {label: t('filters.between'), value: AttributeConditionFilter.BETWEEN},
    {label: t('filters.start-on'), value: AttributeConditionFilter.START_ON},
    {label: t('filters.start-after'), value: AttributeConditionFilter.START_AFTER},
    {label: t('filters.start-before'), value: AttributeConditionFilter.START_BEFORE},
    {label: t('filters.end-on'), value: AttributeConditionFilter.END_ON},
    {label: t('filters.end-after'), value: AttributeConditionFilter.END_AFTER},
    {label: t('filters.end-before'), value: AttributeConditionFilter.END_BEFORE},
    {label: t('filters.is-empty'), value: AttributeConditionFilter.IS_EMPTY},
    {label: t('filters.is-not-empty'), value: AttributeConditionFilter.IS_NOT_EMPTY},
    {label: t('filters.values-count-equal'), value: AttributeConditionFilter.VALUES_COUNT_EQUAL},
    {label: t('filters.values-count-greater-than'), value: AttributeConditionFilter.VALUES_COUNT_GREATER_THAN},
    {label: t('filters.values-count-lower-than'), value: AttributeConditionFilter.VALUES_COUNT_LOWER_THAN},
    {label: t('filters.through'), value: AttributeConditionFilter.THROUGH},
];

export const getFirstConditionByFilterType = (
    filter: UIFilter,
): Array<RecordFilterCondition | ThroughConditionFilter> => {
    if (isUIFilterValueList(filter)) {
        return valueListTextConditions;
    }
    if (isUIFilterStandard(filter)) {
        return conditionsByFormat[filter.attribute.format] ?? [];
    }
    if (isUIFilterLink(filter)) {
        return linkFilterConditions ?? [];
    }
    if (isUIFilterTree(filter)) {
        return treeFilterConditions ?? [];
    }
    if (isUIFilterThrough(filter)) {
        return [AttributeConditionFilter.THROUGH];
    }
    return [];
};

export const useConditionsOptionsByType = (filter: UIFilter) => {
    const {t} = useSharedTranslation();

    return {
        conditionOptionsByType: getAttributeConditionOptions(t)
            .filter(({value}) => {
                // Use special condition set for text fields with closed list values
                if (isUIFilterValueList(filter)) {
                    return valueListTextConditions.includes(value as RecordFilterCondition);
                }
                if (isUIFilterStandard(filter)) {
                    return conditionsByFormat[filter.attribute.format].includes(value as RecordFilterCondition);
                }
                if (isUIFilterLink(filter) || isUIFilterThrough(filter)) {
                    return linkFilterConditions.includes(value);
                }
                if (isUIFilterTree(filter)) {
                    return treeFilterConditions.includes(value as RecordFilterCondition);
                }
            })
            .map(option => ({
                ...option,
                label:
                    isUIFilterStandard(filter) && option.textByFormat?.[filter.attribute.format]
                        ? option.textByFormat?.[filter.attribute.format]
                        : option.label,
            })),
    };
};
