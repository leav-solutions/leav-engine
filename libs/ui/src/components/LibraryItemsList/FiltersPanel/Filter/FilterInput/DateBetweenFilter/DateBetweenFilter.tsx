// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDateRangeValue} from '@leav/utils';
import {DatePicker} from 'antd';
import dayjs from 'dayjs';
import {themeVars} from '_ui/antdTheme';
import {IFilterInputProps} from '../../Filter';

const DateBetweenFilter = ({filter, updateFilterValue}: IFilterInputProps) => {
    const dateRangeValue: IDateRangeValue =
        (filter?.value?.value as IDateRangeValue)?.from && (filter?.value?.value as IDateRangeValue)?.to
            ? (filter.value.value as IDateRangeValue)
            : null;
    const _handleChange = (value: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        if (!value) {
            updateFilterValue(null);
            return;
        }

        // Force time to 00:00:00
        const [dateFrom, dateTo] = value;
        dateFrom.startOf('day');
        dateTo.startOf('day');

        updateFilterValue({...filter.value, value: {from: String(dateFrom.unix()), to: String(dateTo.unix())}});
    };

    const momentValue: [dayjs.Dayjs, dayjs.Dayjs] = dateRangeValue
        ? [dayjs(Number(dateRangeValue.from) * 1000), dayjs(Number(dateRangeValue.to) * 1000)]
        : null;

    return (
        <DatePicker.RangePicker
            popupStyle={{background: themeVars.defaultBg}}
            disabled={!filter.active}
            onChange={_handleChange}
            value={momentValue}
        />
    );
};

export default DateBetweenFilter;
