// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import {ConditionFilter, OperatorFilter} from '../../../_types/types';

export function getConditionOptions(t: TFunction) {
    const conditionOptions = [
        {text: t('filters.contains'), value: ConditionFilter.CONTAINS},
        {text: t('filters.not-contains'), value: ConditionFilter.NOT_CONTAINS},
        {text: t('filters.equal'), value: ConditionFilter.EQUAL},
        {text: t('filters.not-equal'), value: ConditionFilter.NOT_EQUAL},
        {text: t('filters.begin-with'), value: ConditionFilter.BEGIN_WITH},
        {text: t('filters.end-with'), value: ConditionFilter.END_WITH},
        {text: t('filters.greater-than'), value: ConditionFilter.GREATER_THAN},
        {text: t('filters.less-than'), value: ConditionFilter.LESS_THAN}
    ];

    return conditionOptions;
}

export function getOperatorOptions(t: TFunction) {
    const operatorOptions = [
        {text: t('filters.and'), value: OperatorFilter.and},
        {text: t('filters.or'), value: OperatorFilter.or}
    ];

    return operatorOptions;
}
