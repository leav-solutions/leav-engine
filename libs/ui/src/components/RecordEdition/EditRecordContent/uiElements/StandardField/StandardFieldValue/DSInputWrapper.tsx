// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {FocusEvent, FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import styled from 'styled-components';
import {InputProps} from 'antd/lib';

interface IDSInputWrapperProps {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    value?: InputProps['value'];
    onChange?: InputProps['onChange'];
    handleSubmit: (value: string, id?: string) => void;
}

const InputContainer = styled.div`
    position: relative;

    .actions {
        position: absolute;
        top: 55%;
        right: 36px;
        display: none;
        z-index: 1000;
    }

    &:hover .actions {
        display: block;
    }
`;

export const DSInputWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    state,
    value,
    infoButton,
    onChange,
    handleSubmit
}) => {
    const {errors} = Form.Item.useStatus();
    const form = Form.useFormInstance();

    const isRequired = state.formElement.settings.required;

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        let valuetoSubmit = e.target.value;
        if (isRequired && valuetoSubmit === '' && state.formElement.values[0]) {
            valuetoSubmit = (state.formElement.values[0] as any).raw_value;
            form.setFieldValue(state.attribute.id, valuetoSubmit);
            form.validateFields();
        }
        handleSubmit(valuetoSubmit, state.attribute.id);
    };

    return (
        <InputContainer>
            <KitInput
                label={state.formElement.settings.label}
                required={isRequired}
                value={value}
                onChange={onChange}
                status={errors.length > 0 ? 'error' : undefined}
                disabled={state.isReadOnly}
                onBlur={handleBlur}
            />
            {/*TODO : Move actions inside KitInput when DS is updated*/}
            <div className="actions">{infoButton}</div>
        </InputContainer>
    );
};
