// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitInput, KitSelect, KitSpace} from 'aristid-ds';
import {ChangeEvent, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {getConditionsOptionsByType} from './filter-conditions';
import {AttributeConditionFilter} from '_ui/types';

export const TextAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter, onDeleteFilter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const conditionsOptions = getConditionsOptionsByType(filter, t);

    const _updateFilter = filterData => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onConditionChanged = condition => {
        _updateFilter({...filter, condition});
    };

    const _onSelectionChanged = (value: string[]) => _updateFilter({...filter, values: value});
    const _onDeleteFilter = () => onDeleteFilter?.();

    // TODO debounce ?
    const _onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && (filter.values?.[0]?.length ?? 0) < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        _onSelectionChanged(event.target.value.length === 0 ? [] : [event.target.value]);
    };

    const showSearch =
        filter.condition !== AttributeConditionFilter.IS_EMPTY &&
        filter.condition !== AttributeConditionFilter.IS_NOT_EMPTY;

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={conditionsOptions} onChange={_onConditionChanged} value={filter.condition} />
            {showSearch && (
                <KitInput
                    placeholder={String(t('type-a-value'))}
                    defaultValue={filter.values?.[0] ?? ''}
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
