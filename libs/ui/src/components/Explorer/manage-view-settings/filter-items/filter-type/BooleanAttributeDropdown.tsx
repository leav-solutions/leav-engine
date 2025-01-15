// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitDivider, KitSpace, KitSwitch} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {FilterOptionsInDropDown} from './filter-options/FilterOptionsInDropDown';

export const BooleanAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {dispatch} = useViewSettingsContext();

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onBooleanChanged: ComponentProps<typeof KitSwitch>['onChange'] = checked => {
        _updateFilter({...filter, condition: AttributeConditionFilter.EQUAL, value: checked ? 'true' : 'false'});
    };

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSwitch defaultValue={Boolean(filter.value)} onChange={_onBooleanChanged} />
            <KitDivider noMargin />
            <FilterOptionsInDropDown filter={filter} />
        </KitSpace>
    );
};
