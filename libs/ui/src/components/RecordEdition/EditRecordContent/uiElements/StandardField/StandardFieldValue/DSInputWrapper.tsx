import {KitInput} from 'aristid-ds';
import {FocusEvent, FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';

import {Form} from 'antd';
import styled from 'styled-components';

interface IDSInputWrapperProps {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    value?: string;
    onChange?: () => void;
    _handleSubmit: (value: string, id?: string) => void;
    resetField: () => void;
}

const InputContainer = styled.div`
    position: relative;

    .actions {
        position: absolute;
        top: 55%;
        right: 38px;
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
    _handleSubmit,
    resetField
}) => {
    const {errors} = Form.Item.useStatus();
    const isRequired = state.formElement.settings.required;

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        let valuetoSubmit = e.target.value;
        if (isRequired && valuetoSubmit === '' && state.formElement.values[0]) {
            valuetoSubmit = (state.formElement.values[0] as any).raw_value;
            resetField();
        }
        _handleSubmit(valuetoSubmit, state.attribute.id);
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
                allowClear={false}
            />
            {/*TODO : Move actions inside KitInput when DS is updated*/}
            <div className="actions">{infoButton}</div>
        </InputContainer>
    );
};
