// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitSwitch} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {IFilterChildrenDropDownProps} from '_ui/components/Explorer/_types';

export const BooleanAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({filter, onFilterChange}) => {
    const _onBooleanChanged: ComponentProps<typeof KitSwitch>['onChange'] = checked => {
        onFilterChange({...filter, condition: AttributeConditionFilter.EQUAL, value: checked ? 'true' : 'false'});
    };

    return <KitSwitch defaultValue={Boolean(filter.value)} onChange={_onBooleanChanged} />;
};
