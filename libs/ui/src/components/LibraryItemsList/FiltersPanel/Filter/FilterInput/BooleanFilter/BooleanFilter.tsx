// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Switch} from 'antd';
import React from 'react';
import {IFilterInputProps} from '../../Filter';

function BooleanFilter({filter, updateFilterValue}: IFilterInputProps): JSX.Element {
    const _handleChange = (value: boolean) => {
        updateFilterValue({...filter.value, value});
    };

    return (
        <Switch
            disabled={!filter.active}
            data-test-id="filter-input-boolean"
            checked={!!filter.value.value}
            onChange={_handleChange}
        />
    );
}

export default BooleanFilter;
