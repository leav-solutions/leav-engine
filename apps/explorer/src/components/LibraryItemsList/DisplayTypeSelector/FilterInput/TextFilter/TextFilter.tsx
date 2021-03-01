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
    updateFilterValue: (newValue: any, valueSize?: number | 'auto') => void;
}

const TextFilter = ({filter, updateFilterValue}: ITextFilterProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();
        updateFilterValue(newValue);
    };

    const value = filter.value ? String(filter.value) : null;

    return (
        <Text
            disabled={!filter.active}
            value={value}
            onChange={e => handleChange(e)}
            rows={1}
            data-testid="filter-textarea"
        />
    );
};

export default TextFilter;
