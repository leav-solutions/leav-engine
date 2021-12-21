// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker} from 'antd';
import moment from 'moment';
import React from 'react';
import themingVar from '../../../../../themingVar';
import {IDateRangeValue, IFilter} from '../../../../../_types/types';

interface IDateBetweenFilterProps {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
}

const DateBetweenFilter = ({filter, updateFilterValue}: IDateBetweenFilterProps) => {
    const dateRangeValue: IDateRangeValue =
        (filter?.value?.value as IDateRangeValue)?.from && (filter?.value?.value as IDateRangeValue)?.to
            ? (filter.value.value as IDateRangeValue)
            : null;
    const _handleChange = (value: [moment.Moment, moment.Moment] | null) => {
        if (!value) {
            updateFilterValue(null);
            return;
        }

        // Force time to 00:00:00
        const [dateFrom, dateTo] = value;
        dateFrom.utcOffset(0).startOf('day');
        dateTo.utcOffset(0).startOf('day');

        updateFilterValue({...filter.value, value: {from: String(dateFrom.unix()), to: String(dateTo.unix())}});
    };

    const momentValue: [moment.Moment, moment.Moment] = dateRangeValue
        ? [moment(Number(dateRangeValue.from) * 1000), moment(Number(dateRangeValue.to) * 1000)]
        : null;

    return (
        <DatePicker.RangePicker
            popupStyle={{background: themingVar['@default-bg']}}
            disabled={!filter.active}
            onChange={_handleChange}
            value={momentValue}
        />
    );
};

export default DateBetweenFilter;
