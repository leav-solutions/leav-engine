// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type IFilterChildrenDropDownProps} from './_types';
import {EmptyValueCheckbox} from '../shared/EmptyValueCheckbox';

export const ColorAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({filter, onFilterChange}) => {
    const _handleOnCheckEmptyValue = (selected: boolean) => {
        onFilterChange({
            ...filter,
            withEmptyValues: selected,
        });
    };
    return <EmptyValueCheckbox onSelect={_handleOnCheckEmptyValue} filter={filter} />;
};
