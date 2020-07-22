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
        // {text: t('filters.exist'), value: conditionFilter.exist},
        // {text: t('filters.search-in'), value: conditionFilter.searchIn}
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
