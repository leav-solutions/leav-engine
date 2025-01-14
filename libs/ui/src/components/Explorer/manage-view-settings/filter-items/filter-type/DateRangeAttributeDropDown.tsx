// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import {ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {AttributeConditionFilter} from '_ui/types';
import {IExplorerFilter, IFilterDropDownProps} from '../../../_types';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

export const DateRangeAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
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

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.RESET_FILTER,
            payload: {
                id: filter.id
            }
        });

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
        });

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect
                options={conditionOptionsByType}
                onChange={_onConditionChanged}
                value={filter.condition}
                placeholder={t('explorer.select-condition')}
            />
            <KitDivider noMargin />
            <KitButton type="redirect" icon={<FaClock />} onClick={_onResetFilter}>
                {t('explorer.reset-filter')}
            </KitButton>
            <KitButton type="redirect" icon={<FaTrash />} onClick={_onDeleteFilter}>
                {t('global.delete')}
            </KitButton>
        </KitSpace>
    );
};
