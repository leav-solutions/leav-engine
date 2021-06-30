// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import {AttributeConditionFilter, TreeConditionFilter, OperatorFilter} from '../../../_types/types';

export function getAttributeConditionOptions(t: TFunction) {
    return [
        {text: t('filters.contains'), value: AttributeConditionFilter.CONTAINS},
        {text: t('filters.not-contains'), value: AttributeConditionFilter.NOT_CONTAINS},
        {text: t('filters.equal'), value: AttributeConditionFilter.EQUAL},
        {text: t('filters.not-equal'), value: AttributeConditionFilter.NOT_EQUAL},
        {text: t('filters.begin-with'), value: AttributeConditionFilter.BEGIN_WITH},
        {text: t('filters.end-with'), value: AttributeConditionFilter.END_WITH},
        {text: t('filters.greater-than'), value: AttributeConditionFilter.GREATER_THAN},
        {text: t('filters.less-than'), value: AttributeConditionFilter.LESS_THAN}
    ];
}

export function getTreeConditionOptions(t: TFunction) {
    return [
        {text: t('filters.classified-in'), value: TreeConditionFilter.CLASSIFIED_IN},
        {text: t('filters.not-classified-in'), value: TreeConditionFilter.NOT_CLASSIFIED_IN}
    ];
}

export function getOperatorOptions(t: TFunction) {
    return [
        {text: t('filters.and'), value: OperatorFilter.AND},
        {text: t('filters.or'), value: OperatorFilter.OR}
    ];
}
