// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDatePicker, KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import {ComponentProps, FunctionComponent, useRef} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {AttributeConditionFilter} from '_ui/types';
import styled from 'styled-components';
import dayjs from 'dayjs';
import {dateValuesSeparator} from '_ui/components/Explorer/_queries/useExplorerData';
import {nullValueConditions} from '_ui/components/Explorer/nullValuesConditions';

const DatePickerContainerStyledDiv = styled.div`
    .ant-picker {
        width: 100%;
    }
`;

const DatePickerDropdowncontainerStyledDiv = styled.div`
    .ant-picker-dropdown {
        position: initial;

        .ant-picker-panel-container {
            box-shadow: none;
        }
    }
`;

export const DateAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();
    const datePickerRef = useRef<HTMLDivElement>(null);

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        const isMultiDate = filter.value?.includes(dateValuesSeparator);
        const unsetValue =
            nullValueConditions.includes(condition) ||
            (!isMultiDate && condition === AttributeConditionFilter.BETWEEN) ||
            (isMultiDate && condition !== AttributeConditionFilter.BETWEEN);

        _updateFilter({
            ...filter,
            condition,
            value: unsetValue ? null : filter.value
        });
    };

    const _onDateChanged: ComponentProps<typeof KitDatePicker>['onChange'] = date => {
        _updateFilter({
            ...filter,
            value: date ? String(date.unix()) : null
        });
    };

    const _onDateRangeChanged: ComponentProps<typeof KitDatePicker.RangePicker>['onChange'] = dates => {
        let value: string | null = null;

        if (dates && dates.length === 2) {
            let [dateFrom, dateTo] = dates;

            if (dateFrom && dateTo) {
                dateFrom = dateFrom.startOf('day');
                dateTo = dateTo.endOf('day');

                value = dateFrom.unix() + dateValuesSeparator + dateTo.unix();
            }
        }

        _updateFilter({...filter, value});
    };

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
        });

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.RESET_FILTER,
            payload: {
                id: filter.id
            }
        });

    const showDatePicker = !nullValueConditions.includes(filter.condition);

    const getDateRangeValue = (dates: string): [dayjs.Dayjs, dayjs.Dayjs] => {
        const [dateFrom, dateTo] = dates.split(dateValuesSeparator).map(date => dayjs.unix(Number(date)));
        return [dateFrom, dateTo];
    };

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={conditionOptionsByType} onChange={_onConditionChanged} value={filter.condition} />
            {showDatePicker && (
                <DatePickerContainerStyledDiv>
                    {filter.condition === AttributeConditionFilter.BETWEEN ? (
                        <KitDatePicker.RangePicker
                            open
                            getPopupContainer={() => datePickerRef.current ?? document.body}
                            value={filter.value ? getDateRangeValue(filter.value) : null}
                            onChange={_onDateRangeChanged}
                        />
                    ) : (
                        <KitDatePicker
                            open
                            getPopupContainer={() => datePickerRef.current ?? document.body}
                            value={filter.value ? dayjs.unix(Number(filter.value)) : null}
                            onChange={_onDateChanged}
                        />
                    )}
                    <DatePickerDropdowncontainerStyledDiv ref={datePickerRef} />
                </DatePickerContainerStyledDiv>
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
