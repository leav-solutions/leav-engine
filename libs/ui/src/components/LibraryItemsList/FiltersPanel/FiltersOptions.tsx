// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import {
    AttributeConditionFilter,
    AttributeConditionType,
    FilterType,
    IFilter,
    IFilterAttribute,
    OperatorFilter,
    TreeConditionFilter
} from '_ui/types/search';
import {AttributeFormat, RecordFilterCondition} from '_ui/_gqlTypes';

export interface IFilterConditionOption<T> {
    text: string;
    value: T;
    textByFormat?: {[key in AttributeFormat]?: string};
}

const allowedConditionByFormat: {[format in AttributeFormat]: AttributeConditionType[]} = {
    [AttributeFormat.text]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.BEGIN_WITH,
        AttributeConditionFilter.END_WITH,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ],
    [AttributeFormat.extended]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.BEGIN_WITH,
        AttributeConditionFilter.END_WITH,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ],
    [AttributeFormat.encrypted]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.numeric]: [
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.GREATER_THAN,
        AttributeConditionFilter.LESS_THAN,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ],
    [AttributeFormat.boolean]: [AttributeConditionFilter.EQUAL, AttributeConditionFilter.NOT_EQUAL],
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
        AttributeConditionFilter.BETWEEN
    ],
    [AttributeFormat.date_range]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.START_ON,
        AttributeConditionFilter.START_AFTER,
        AttributeConditionFilter.START_BEFORE,
        AttributeConditionFilter.END_ON,
        AttributeConditionFilter.END_AFTER,
        AttributeConditionFilter.END_BEFORE,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ],
    [AttributeFormat.color]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ],
    [AttributeFormat.rich_text]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
    ]
};

export function getAttributeConditionOptions(t: TFunction): Array<IFilterConditionOption<AttributeConditionType>> {
    return [
        {text: t('filters.contains'), value: AttributeConditionFilter.CONTAINS},
        {text: t('filters.not-contains'), value: AttributeConditionFilter.NOT_CONTAINS},
        {text: t('filters.equal'), value: AttributeConditionFilter.EQUAL},
        {text: t('filters.not-equal'), value: AttributeConditionFilter.NOT_EQUAL},
        {text: t('filters.begin-with'), value: AttributeConditionFilter.BEGIN_WITH},
        {text: t('filters.end-with'), value: AttributeConditionFilter.END_WITH},
        {
            text: t('filters.less-than'),
            textByFormat: {[AttributeFormat.date]: t('filters.before')},
            value: AttributeConditionFilter.LESS_THAN
        },
        {
            text: t('filters.greater-than'),
            textByFormat: {[AttributeFormat.date]: t('filters.after')},
            value: AttributeConditionFilter.GREATER_THAN
        },
        {text: t('filters.today'), value: AttributeConditionFilter.TODAY},
        {text: t('filters.tomorrow'), value: AttributeConditionFilter.TOMORROW},
        {text: t('filters.yesterday'), value: AttributeConditionFilter.YESTERDAY},
        {text: t('filters.last-month'), value: AttributeConditionFilter.LAST_MONTH},
        {text: t('filters.next-month'), value: AttributeConditionFilter.NEXT_MONTH},
        {text: t('filters.between'), value: AttributeConditionFilter.BETWEEN},
        {text: t('filters.start-on'), value: AttributeConditionFilter.START_ON},
        {text: t('filters.start-after'), value: AttributeConditionFilter.START_AFTER},
        {text: t('filters.start-before'), value: AttributeConditionFilter.START_BEFORE},
        {text: t('filters.end-on'), value: AttributeConditionFilter.END_ON},
        {text: t('filters.end-after'), value: AttributeConditionFilter.END_AFTER},
        {text: t('filters.end-before'), value: AttributeConditionFilter.END_BEFORE},
        {text: t('filters.is-empty'), value: AttributeConditionFilter.IS_EMPTY},
        {text: t('filters.is-not-empty'), value: AttributeConditionFilter.IS_NOT_EMPTY},
        {text: t('filters.values-count-equal'), value: AttributeConditionFilter.VALUES_COUNT_EQUAL},
        {text: t('filters.values-count-greater-than'), value: AttributeConditionFilter.VALUES_COUNT_GREATER_THAN},
        {text: t('filters.values-count-lower-than'), value: AttributeConditionFilter.VALUES_COUNT_LOWER_THAN},
        {text: t('filters.through'), value: AttributeConditionFilter.THROUGH}
    ];
}

export function getTreeConditionOptions(t: TFunction): Array<IFilterConditionOption<TreeConditionFilter>> {
    return [
        {text: t('filters.classified-in'), value: TreeConditionFilter.CLASSIFIED_IN},
        {text: t('filters.not-classified-in'), value: TreeConditionFilter.NOT_CLASSIFIED_IN}
    ];
}

export function getOperatorOptions(t: TFunction): Array<IFilterConditionOption<OperatorFilter>> {
    return [
        {text: t('filters.and'), value: OperatorFilter.AND},
        {text: t('filters.or'), value: OperatorFilter.OR}
    ];
}

export const getConditionOptionsByType = (
    filter: IFilter,
    showThroughCondition: boolean,
    t: TFunction
): Array<IFilterConditionOption<AttributeConditionType>> => {
    const _isValuesCountCondition = (condition: AttributeConditionType): boolean => [
            AttributeConditionFilter.VALUES_COUNT_EQUAL,
            AttributeConditionFilter.VALUES_COUNT_GREATER_THAN,
            AttributeConditionFilter.VALUES_COUNT_LOWER_THAN
        ].includes(condition as RecordFilterCondition);

    const attributeConditionOptions = getAttributeConditionOptions(t);

    const conditionOptionsByType = attributeConditionOptions.filter(conditionOption => {
        // "Through" condition
        if (conditionOption.value === AttributeConditionFilter.THROUGH && showThroughCondition) {
            return true;
        }

        // Filter on library (applied to tree attribute only) => show condition for text attribute
        if (
            filter.type === FilterType.LIBRARY &&
            allowedConditionByFormat[AttributeFormat.text].includes(conditionOption.value)
        ) {
            return true;
        }

        // Regular attribute filter => show condition based on format + values count if multiple values is allowed
        if (filter.type === FilterType.ATTRIBUTE) {
            const attributeFilter = filter as IFilterAttribute;
            if (
                ((filter as IFilterAttribute).attribute?.format &&
                    allowedConditionByFormat[attributeFilter.attribute.format]?.includes(conditionOption.value)) ||
                (attributeFilter.attribute.isMultiple && _isValuesCountCondition(conditionOption.value))
            ) {
                return true;
            }
        }

        return false;
    });

    return conditionOptionsByType;
};
