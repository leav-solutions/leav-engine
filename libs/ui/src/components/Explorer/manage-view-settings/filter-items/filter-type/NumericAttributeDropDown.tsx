// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitInput, KitInputNumber, KitSelect, KitSpace} from 'aristid-ds';
import {ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {AttributeConditionFilter} from '_ui/types';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import styled from 'styled-components';

const InputNumberStyled = styled(KitInputNumber)`
    width: 100%;
`;

export const NumericAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
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

    const _onInputChanged: ComponentProps<typeof KitInputNumber>['onChange'] = value =>
        _updateFilter({...filter, value: value === null ? null : String(value)});

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () => _updateFilter({...filter, value: null});

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
        });

    const showInput =
        filter.condition !== AttributeConditionFilter.IS_EMPTY &&
        filter.condition !== AttributeConditionFilter.IS_NOT_EMPTY;

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={conditionOptionsByType} onChange={_onConditionChanged} value={filter.condition} />
            {showInput && (
                <InputNumberStyled
                    placeholder={String(t('explorer.type-a-value'))}
                    defaultValue={filter.value ?? undefined}
                    onChange={_onInputChanged}
                />
            )}
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
