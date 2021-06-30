// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, Radio} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';
import React from 'react';
import styled from 'styled-components';
import {IFilter} from '../../../../_types/types';

const CustomForm = styled(Form)`
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin: 1rem 1rem 0 1rem;
`;

interface IFormBooleanProps {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

function FormBoolean({filter, updateFilterValue}: IFormBooleanProps): JSX.Element {
    const handleChange = (event: CheckboxChangeEvent) => {
        const newFilterValue = !!event.target.value;
        updateFilterValue(newFilterValue);
    };

    return (
        <CustomForm>
            <Form.Item>
                <Radio name="checkboxRadioGroup" checked={!!filter.value.value} value={1} onChange={handleChange}>
                    True
                </Radio>
            </Form.Item>

            <Form.Item>
                <Radio name="checkboxRadioGroup" checked={!filter.value.value} value={0} onChange={handleChange}>
                    False
                </Radio>
            </Form.Item>
        </CustomForm>
    );
}

export default FormBoolean;
