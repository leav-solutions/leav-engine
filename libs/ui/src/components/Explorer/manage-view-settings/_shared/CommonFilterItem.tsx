// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FilterDropDown} from '../filter-items/filter-type/FilterDropDown';
import styled from 'styled-components';
import {KitFilter} from 'aristid-ds';
import {ExplorerFilter} from '../../_types';
import {nullValueConditions} from '../../conditionsHelper';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const getFilterValue = filter => {
    if (nullValueConditions.includes(filter.condition)) {
        return [filter.condition];
    }
    return filter.value ? [filter.value] : [];
};

export const CommonFilterItem: FunctionComponent<{filter: ExplorerFilter; disabled?: boolean}> = ({
    filter,
    disabled
}) => (
    <FilterStyled
        expandable
        disabled={disabled}
        label={filter.attribute.label}
        values={getFilterValue(filter)}
        dropDownProps={{
            placement: 'bottomLeft',
            dropdownRender: () => <FilterDropDown filter={filter} />
        }}
    />
);
