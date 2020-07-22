import React from 'react';
import {IFilter} from '../../../../../_types/types';
import {Form, Checkbox, CheckboxProps} from 'semantic-ui-react';
import styled from 'styled-components';

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
    const handleChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        const newFilterValue = !!data.value;
        updateFilterValue(newFilterValue);
    };

    return (
        <>
            <CustomForm>
                <Form.Field>
                    <Checkbox
                        radio
                        label="true"
                        name="checkboxRadioGroup"
                        checked={!!filter.value}
                        value={1}
                        onChange={handleChange}
                    />
                </Form.Field>

                <Form.Field>
                    <Checkbox
                        radio
                        label="false"
                        name="checkboxRadioGroup"
                        checked={!filter.value}
                        value={0}
                        onChange={handleChange}
                    />
                </Form.Field>
            </CustomForm>
        </>
    );
}

export default FormBoolean;
