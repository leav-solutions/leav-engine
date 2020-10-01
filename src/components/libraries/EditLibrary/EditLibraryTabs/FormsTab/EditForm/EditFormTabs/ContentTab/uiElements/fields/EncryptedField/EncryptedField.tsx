import React from 'react';
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

function EncryptedField(props: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {label = 'Toto'} = props.settings;
    const fieldProps = {
        label
    };

    return <Input type="password" {...fieldProps} />;
}

export default EncryptedField;
