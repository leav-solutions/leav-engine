// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker} from 'antd';
import moment from 'moment';
import React from 'react';
import themingVar from '../../../../../../themingVar';
import {IFilterInputProps} from '../../Filter';

const DateFilter = ({filter, updateFilterValue}: IFilterInputProps) => {
    const _handleChange = (value: moment.Moment | null) => {
        if (!value) {
            updateFilterValue(null);
            return;
        }

        // Force time to 00:00:00
        value.utcOffset(0).startOf('day');

        updateFilterValue({...filter.value, value: value.unix()});
    };

    const momentValue = filter?.value?.value ? moment(Number(filter.value.value) * 1000) : null;

    return (
        <DatePicker
            popupStyle={{background: themingVar['@default-bg']}}
            disabled={!filter.active}
            onOk={_handleChange}
            onChange={_handleChange}
            value={momentValue}
        />
    );
};

export default DateFilter;
