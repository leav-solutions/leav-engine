// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import {IFilter} from '../../../../../_types/types';

interface INumericFilterProps {
    filter: IFilter;
    updateFilterValue: (newValue: any, valueSize?: number | 'auto') => void;
}

const NumericFilter = ({filter, updateFilterValue}: INumericFilterProps) => {
    const _handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value ?? 0);
        updateFilterValue(newValue);
    };

    return (
        <Input type="number" disabled={!filter.active} value={Number(filter.value)} onChange={e => _handleChange(e)} />
    );
};

export default NumericFilter;
