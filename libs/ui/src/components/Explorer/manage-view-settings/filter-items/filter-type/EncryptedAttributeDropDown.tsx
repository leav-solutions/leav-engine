// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {FilterOptionsInDropDown} from './filter-options/FilterOptionsInDropDown';

export const EncryptedAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        _updateFilter({...filter, condition});

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect
                options={conditionOptionsByType}
                onChange={_onConditionChanged}
                value={filter.condition}
                placeholder={t('explorer.select-condition')}
            />
            <KitDivider noMargin />
            <FilterOptionsInDropDown filter={filter} />
        </KitSpace>
    );
};
