// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {DatePicker} from 'antd';
import dayjs from 'dayjs';
import {IFilterInputProps} from '../../Filter';

const DateFilter = ({filter, updateFilterValue}: IFilterInputProps) => {
    const _handleChange = (value: dayjs.Dayjs | null) => {
        if (!value) {
            updateFilterValue(null);
            return;
        }

        // Force time to 00:00:00
        value.startOf('day');

        updateFilterValue({...filter.value, value: value.unix()});
    };

    const value = filter?.value?.value ? dayjs(Number(filter.value.value) * 1000) : null;

    return (
        <DatePicker
            popupStyle={{background: themeVars.defaultBg}}
            disabled={!filter.active}
            onOk={_handleChange}
            onChange={_handleChange}
            aria-label="date-filter"
            value={value}
        />
    );
};

export default DateFilter;
