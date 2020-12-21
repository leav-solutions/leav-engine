// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import {ConditionFilter, OperatorFilter} from '../../../_types/types';

export function getConditionOptions(t: TFunction) {
    const conditionOptions = [
        {text: t('filters.contains'), value: ConditionFilter.contains},
        {text: t('filters.not-contains'), value: ConditionFilter.notContains},
        {text: t('filters.equal'), value: ConditionFilter.equal},
        {text: t('filters.not-equal'), value: ConditionFilter.notEqual},
        {text: t('filters.begin-with'), value: ConditionFilter.beginWith},
        {text: t('filters.end-with'), value: ConditionFilter.endWith},
        {text: t('filters.greater-than'), value: ConditionFilter.greaterThan},
        {text: t('filters.less-than'), value: ConditionFilter.lessThan}
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
