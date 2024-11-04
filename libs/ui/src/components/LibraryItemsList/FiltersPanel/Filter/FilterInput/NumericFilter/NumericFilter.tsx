// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IFilterInputProps} from '../../Filter';

const StyledInput = styled(Input)`
    // Remove arrows on number input
    && {
        -moz-appearance: textfield;
        ::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
`;

const NumericFilter = ({filter, updateFilterValue, onPressEnter}: IFilterInputProps) => {
    const _handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // If input is not a valid number, event.target.value will be an empty string
        const newValue = event.target.value || 0;
        updateFilterValue({...filter.value, value: newValue});
    };

    const _handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        onPressEnter();
    };

    const filterValue = isNaN(Number(filter.value.value)) ? '' : (filter.value.value as number);

    return (
        <StyledInput
            type="number"
            disabled={!filter.active}
            value={filterValue}
            onChange={_handleChange}
            onKeyDown={_handleKeyDown}
        />
    );
};

export default NumericFilter;
