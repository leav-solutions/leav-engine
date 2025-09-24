// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {FilterDropDown} from '../filter-items/filter-type/FilterDropDown';
import styled from 'styled-components';
import {KitFilter} from 'aristid-ds';
import {isExplorerFilterStandard, isExplorerFilterTree, type ExplorerFilter} from '../../_types';
import {nullValueConditions} from '../../conditionsHelper';
import {AttributeFormat} from '_ui/_gqlTypes';
import {useTranslation} from 'react-i18next';
import {getAttributeConditionOptions} from '../filter-items/filter-type/useConditionOptionsByType';
import {TFunction} from 'i18next';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const getFilterValues = (filter: ExplorerFilter, t: TFunction) => {
    if (filter.condition && nullValueConditions.includes(filter.condition)) {
        const conditionOption = getAttributeConditionOptions(t).find(option => option.value === filter.condition);
        return [conditionOption?.label ?? ''];
    }

    if (isExplorerFilterTree(filter)) {
        return filter.formattedValue ?? [];
    }

    if (isExplorerFilterStandard(filter) && filter.attribute.format === AttributeFormat.date) {
        return filter.formattedValue ? [filter.formattedValue] : [];
    }

    return Array.isArray(filter.value) ? filter.value : filter.value ? [filter.value] : [];
};

export const CommonFilterItem: FunctionComponent<{filter: ExplorerFilter; disabled?: boolean}> = ({
    filter,
    disabled
}) => {
    const {t} = useTranslation();

    return (
        <FilterStyled
            expandable
            disabled={disabled}
            label={filter.attribute.label}
            values={getFilterValues(filter, t)}
            dropDownProps={{
                placement: 'bottomLeft',
                dropdownRender: () => <FilterDropDown filter={filter} />
            }}
        />
    );
};
