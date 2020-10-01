import React from 'react';
import {Checkbox} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

function CheckboxField(props: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {label = 'Toto'} = props.settings;
    const fieldProps = {
        label
    };

    return <Checkbox toggle {...fieldProps} />;
}

export default CheckboxField;
