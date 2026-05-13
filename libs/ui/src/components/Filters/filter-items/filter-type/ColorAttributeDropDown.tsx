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
