// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitInput, KitSelect, KitSpace} from 'aristid-ds';
import {ChangeEvent, ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {AttributeConditionFilter} from '_ui/types';

export const TextAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        _updateFilter({...filter, condition});
    };

    // TODO debounce ?
    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && (filter.value?.length ?? 0) < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        _updateFilter({...filter, value: event.target.value.length === 0 ? null : event.target.value});
    };

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
        });

    const showSearch =
        filter.condition !== AttributeConditionFilter.IS_EMPTY &&
        filter.condition !== AttributeConditionFilter.IS_NOT_EMPTY;

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={conditionOptionsByType} onChange={_onConditionChanged} value={filter.condition} />
            {showSearch && (
                <KitInput
                    placeholder={String(t('explorer.type-a-value'))}
                    defaultValue={filter.value ?? undefined}
                    onChange={_onInputChanged}
                />
            )}
            <KitDivider noMargin />
            <KitButton type="link" icon={<FaClock />} disabled>
                {t('explorer.reset-filter')}
            </KitButton>
            <KitButton type="link" icon={<FaTrash />} onClick={_onDeleteFilter}>
                {t('global.delete')}
            </KitButton>
        </KitSpace>
    );
};
