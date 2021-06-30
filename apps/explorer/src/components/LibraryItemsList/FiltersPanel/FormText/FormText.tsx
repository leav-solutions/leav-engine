// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IFilter} from '_types/types';

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

const CustomForm = styled(Form)`
    width: 100%;
`;

interface IFormTextProps {
    filter: IFilter;
    updateFilterValue: (newValue: any, valueSize?: number | 'auto') => void;
}

const FormText = ({filter, updateFilterValue}: IFormTextProps) => {
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
        <CustomForm>
            <TextAreaWrapper>
                <Input.TextArea
                    disabled={!filter.active}
                    value={String(filter.value.value)}
                    onChange={e => handleChange(e)}
                    onResize={handleResize}
                    rows={1}
                />
            </TextAreaWrapper>
        </CustomForm>
    );
};

export default FormText;
