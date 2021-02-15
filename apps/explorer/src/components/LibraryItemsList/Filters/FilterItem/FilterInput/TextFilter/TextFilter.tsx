// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import {IFilter} from '../../../../../../_types/types';

interface ITextFilterProps {
    filter: IFilter;
    updateFilterValue: (newValue: any, valueSize?: number | 'auto') => void;
}

const TextFilter = ({filter, updateFilterValue}: ITextFilterProps) => {
    let valueChange = false;
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();
        updateFilterValue(newValue);
        valueChange = true;
    };

    const handleResize = (size: {width: number; height: number}) => {
        if (valueChange) {
            updateFilterValue(filter.value, size.height);
        }
        valueChange = false;
    };

    return (
        <Input.TextArea
            disabled={!filter.active}
            value={String(filter.value)}
            onChange={e => handleChange(e)}
            onResize={handleResize}
            style={{height: filter.valueSize}}
            rows={1}
        />
    );
};

export default TextFilter;
