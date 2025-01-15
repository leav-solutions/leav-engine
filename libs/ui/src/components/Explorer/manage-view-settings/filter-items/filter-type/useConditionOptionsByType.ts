// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '_ui/_gqlTypes';
import {IExplorerFilter} from '_ui/components/Explorer/_types';
import {AttributeConditionFilter, AttributeConditionType} from '_ui/types';
import {TFunction} from 'i18next';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const conditionsByFormat: Record<AttributeFormat, AttributeConditionType[]> = {
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
    [AttributeFormat.rich_text]: [
        AttributeConditionFilter.CONTAINS,
        AttributeConditionFilter.NOT_CONTAINS,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY
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
        AttributeConditionFilter.BETWEEN
    ],
    [AttributeFormat.date_range]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.encrypted]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.extended]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.color]: [AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY],
    [AttributeFormat.numeric]: [
        AttributeConditionFilter.EQUAL,
        AttributeConditionFilter.NOT_EQUAL,
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
        AttributeConditionFilter.LESS_THAN,
        AttributeConditionFilter.GREATER_THAN
    ]
};

interface IExplorerFilterConditionOption<T> {
    label: string;
    value: T;
    textByFormat?: {[key in AttributeFormat]?: string};
}

const _getAttributeConditionOptions = (t: TFunction): Array<IExplorerFilterConditionOption<AttributeConditionType>> => [
    {label: t('filters.contains'), value: AttributeConditionFilter.CONTAINS},
    {label: t('filters.not-contains'), value: AttributeConditionFilter.NOT_CONTAINS},
    {label: t('filters.equal'), value: AttributeConditionFilter.EQUAL},
    {label: t('filters.not-equal'), value: AttributeConditionFilter.NOT_EQUAL},
    {label: t('filters.begin-with'), value: AttributeConditionFilter.BEGIN_WITH},
    {label: t('filters.end-with'), value: AttributeConditionFilter.END_WITH},
    {
        label: t('filters.less-than'),
        textByFormat: {[AttributeFormat.date]: String(t('filters.before'))},
        value: AttributeConditionFilter.LESS_THAN
    },
    {
        label: t('filters.greater-than'),
        textByFormat: {[AttributeFormat.date]: String(t('filters.after'))},
        value: AttributeConditionFilter.GREATER_THAN
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
    {label: t('filters.through'), value: AttributeConditionFilter.THROUGH}
];

export const useConditionsOptionsByType = (filter: IExplorerFilter) => {
    const {t} = useSharedTranslation();

    const attributeConditionOptions = _getAttributeConditionOptions(t);

    return {
        conditionOptionsByType: attributeConditionOptions
            .filter(({value}) => conditionsByFormat[filter.attribute.format].includes(value))
            .map(option => ({
                ...option,
                label: option.textByFormat?.[filter.attribute.format] ?? option.label
            }))
    };
};
