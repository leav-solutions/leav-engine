import React from 'react';
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

interface IInputFieldSettings extends ICommonFieldsSettings {
    type?: 'text' | 'number';
}

function InputField(props: IFormElementProps<IInputFieldSettings>): JSX.Element {
    const {label, type = 'text'} = props.settings;

    const fieldProps = {
        label
    };

    return <Input type={type} {...fieldProps} fluid />;
}

export default InputField;
