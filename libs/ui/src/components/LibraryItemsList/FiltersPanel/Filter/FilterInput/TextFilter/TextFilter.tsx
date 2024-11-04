// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {IFilterInputProps} from '../../Filter';

const Text = styled(Input.TextArea)`
    background: ${themeVars.defaultBg} 0% 0% no-repeat padding-box;
    border: 1px solid ${themeVars.borderColor};
    border-radius: 3px;
`;

const MAX_INPUT_ROWS = 5;

const TextFilter = ({filter, updateFilterValue, onPressEnter}: IFilterInputProps) => {
    const _handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();

        updateFilterValue({...filter.value, value: newValue});
    };

    const _handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // If holding shift key, keep normal behavior (ie. insert new line)
        if (e.shiftKey) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        onPressEnter();
    };

    const value = filter.value.value ? String(filter.value.value) : null;
    const textRows = value ? value.split('\n').length : 1;
    const inputRows = textRows <= MAX_INPUT_ROWS ? textRows : MAX_INPUT_ROWS;

    return (
        <Text
            disabled={!filter.active}
            rows={inputRows}
            value={value}
            onChange={_handleChange}
            onPressEnter={_handlePressEnter}
            data-testid="filter-textarea"
        />
    );
};

export default TextFilter;
