// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IFilter} from '../../../../../_types/types';

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

const CustomForm = styled(Form)`
    width: 100%;
`;

interface IFormTextProps {
    filter: IFilter;
    updateFilterValue: (newFilterValue: IFilter['value']) => void;
}

const FormText = ({filter, updateFilterValue}: IFormTextProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();

        updateFilterValue({...filter.value, value: newValue});
    };

    return (
        <CustomForm>
            <TextAreaWrapper>
                <Input.TextArea
                    disabled={!filter.active}
                    value={String(filter.value.value)}
                    onChange={handleChange}
                    rows={1}
                />
            </TextAreaWrapper>
        </CustomForm>
    );
};

export default FormText;
