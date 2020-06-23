import {TFunction} from 'i18next';
import {conditionFilter, operatorFilter} from '../../../_types/types';

export function getConditionOptions(t: TFunction) {
    const conditionOptions = [
        {text: t('filters.contains'), value: conditionFilter.contains},
        {text: t('filters.not-contains'), value: conditionFilter.notContains},
        {text: t('filters.equal'), value: conditionFilter.equal},
        {text: t('filters.not-equal'), value: conditionFilter.notEqual},
        {text: t('filters.begin-with'), value: conditionFilter.beginWith},
        {text: t('filters.end-with'), value: conditionFilter.endWith},
        {text: t('filters.is-empty'), value: conditionFilter.empty},
        {text: t('filters.is-not-empty'), value: conditionFilter.notEmpty},
        {text: t('filters.greater-than'), value: conditionFilter.greaterThan},
        {text: t('filters.less-than'), value: conditionFilter.lessThan},
        {text: t('filters.exist'), value: conditionFilter.exist},
        {text: t('filters.search-in'), value: conditionFilter.searchIn}
    ];

    return conditionOptions;
}

export function getOperatorOptions(t: TFunction) {
    const operatorOptions = [
        {text: t('filters.and'), value: operatorFilter.and},
        {text: t('filters.or'), value: operatorFilter.or}
    ];

    return operatorOptions;
}
