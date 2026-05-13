import {type ComponentProps, type FunctionComponent, useRef} from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {KitDatePicker, KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {type IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {nullValueConditions} from '../../conditionsHelper';
import {dateValuesSeparator} from '_ui/components/Explorer/_queries/useExplorerData';

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

export const DateAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const datePickerRef = useRef<HTMLDivElement>(null);

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        const isMultiDate = filter.value?.includes(dateValuesSeparator);
        const unsetValue =
            nullValueConditions.includes(condition) ||
            (!isMultiDate && condition === AttributeConditionFilter.BETWEEN) ||
            (isMultiDate && condition !== AttributeConditionFilter.BETWEEN);

        onFilterChange({
            ...filter,
            condition,
            value: unsetValue ? null : filter.value,
        });
    };

    const _onDateChanged: ComponentProps<typeof KitDatePicker>['onChange'] = date => {
        onFilterChange({
            ...filter,
            value: date ? String(date.unix()) : null,
            formattedValue: date ? date.format('YYYY-MM-DD') : null, //TODO: Date format should come from the backend (will be adress in a later ticket)
        });
    };

    const _onDateRangeChanged: ComponentProps<typeof KitDatePicker.RangePicker>['onChange'] = dates => {
        let value: string | null = null;
        let formattedValue: string | null = null;

        if (dates && dates.length === 2) {
            let [dateFrom, dateTo] = dates;

            if (dateFrom && dateTo) {
                dateFrom = dateFrom.startOf('day');
                dateTo = dateTo.endOf('day');

                value = dateFrom.unix() + dateValuesSeparator + dateTo.unix();
                formattedValue = dateFrom.format('YYYY-MM-DD') + ' -> ' + dateTo.format('YYYY-MM-DD'); //TODO: Date format should come from the backend (will be adress in a later ticket)
            }
        }

        onFilterChange({...filter, value, formattedValue});
    };

    const showDatePicker = filter.condition && !nullValueConditions.includes(filter.condition);

    const getDateRangeValue = (dates: string): [dayjs.Dayjs, dayjs.Dayjs] => {
        const [dateFrom, dateTo] = dates.split(dateValuesSeparator).map(date => dayjs.unix(Number(date)));
        return [dateFrom, dateTo];
    };

    return (
        <>
            <KitSelect
                options={conditionOptionsByType}
                onChange={_onConditionChanged}
                value={filter.condition}
                getPopupContainer={() => selectDropDownRef?.current ?? document.body}
            />
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
        </>
    );
};
