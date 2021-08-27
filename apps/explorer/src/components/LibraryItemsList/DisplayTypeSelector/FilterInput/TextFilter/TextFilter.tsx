// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {IFilter} from '../../../../../_types/types';

const Text = styled(Input.TextArea)`
    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;
`;

interface ITextFilterProps {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
}

const MAX_INPUT_ROWS = 5;

const TextFilter = ({filter, updateFilterValue}: ITextFilterProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();

        updateFilterValue({...filter.value, value: newValue});
    };

    const value = filter.value.value ? String(filter.value.value) : null;
    const textRows = value ? value.split('\n').length : 1;
    const inputRows = textRows <= MAX_INPUT_ROWS ? textRows : MAX_INPUT_ROWS;

    return (
        <Text
            disabled={!filter.active}
            rows={inputRows}
            value={value}
            onChange={handleChange}
            data-testid="filter-textarea"
        />
    );
};

export default TextFilter;
