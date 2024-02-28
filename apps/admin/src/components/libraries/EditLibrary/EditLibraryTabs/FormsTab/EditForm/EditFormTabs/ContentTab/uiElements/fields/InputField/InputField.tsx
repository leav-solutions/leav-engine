// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';
import styled from 'styled-components';

const StyledInput = styled(Input)`
    &.required .label::before {
        content: '* ';
        color: red;
    }
`;

interface IInputFieldSettings extends ICommonFieldsSettings {
    type?: 'text' | 'number';
    required?: boolean;
}

function InputField(props: IFormElementProps<IInputFieldSettings>): JSX.Element {
    const {label, type = 'text', required} = props.settings;

    const fieldProps = {
        label
    };

    return <StyledInput className={required ? 'required' : undefined} type={type} {...fieldProps} fluid />;
}

export default InputField;
