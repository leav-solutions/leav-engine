// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {FilterDropDown} from '../filter-items/filter-type/FilterDropDown';
import styled from 'styled-components';
import {KitFilter} from 'aristid-ds';
import {AttributeFormat} from '_ui/_gqlTypes';
import {useTranslation} from 'react-i18next';
import {getAttributeConditionOptions} from '../filter-items/filter-type/useConditionOptionsByType';
import {type TFunction} from 'i18next';
import {nullValueConditions} from '../conditionsHelper';
import {isUIFilterStandard, isUIFilterTree, type UIFilter} from '../_types';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;
const getFilterValues = (filter: UIFilter, t: TFunction): string[] => {
    if (filter.condition && nullValueConditions.includes(filter.condition)) {
        const conditionOption = getAttributeConditionOptions(t).find(option => option.value === filter.condition);
        return [conditionOption?.label ?? ''];
    }

    const filterValues: string[] = filter.withEmptyValues ? [t('filters.empty-value')] : [];

    if (isUIFilterTree(filter)) {
        return [...filterValues, ...(filter.formattedValue ?? [])];
    }

    if (
        isUIFilterStandard(filter) &&
        [AttributeFormat.date, AttributeFormat.boolean].includes(filter.attribute.format)
    ) {
        return filter.formattedValue ? [...filterValues, ...filter.formattedValue] : filterValues;
    }

    if (Array.isArray(filter.value)) {
        return [...filterValues, ...filter.value];
    } else if (filter.value) {
        return [...filterValues, filter.value];
    }
    return filterValues;
};

export interface ICommonFilterProps {
    filter: UIFilter;
    isPinned?: boolean;
    disabled?: boolean;
}

export const CommonFilterItem: FunctionComponent<ICommonFilterProps> = ({filter, isPinned = false, disabled}) => {
    const {t} = useTranslation();

    return (
        <FilterStyled
            expandable
            disabled={disabled}
            label={filter.attribute.label}
            values={getFilterValues(filter, t)}
            dropDownProps={{
                placement: 'bottomLeft',
                dropdownRender: () => <FilterDropDown filter={filter} canRemove={!isPinned} />,
            }}
        />
    );
};
