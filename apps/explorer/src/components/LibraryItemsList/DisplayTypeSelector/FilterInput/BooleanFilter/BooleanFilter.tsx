// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Switch} from 'antd';
import React from 'react';
import {IFilter} from '../../../../../_types/types';

interface IBooleanFilterProps {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
}

function BooleanFilter({filter, updateFilterValue}: IBooleanFilterProps): JSX.Element {
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
