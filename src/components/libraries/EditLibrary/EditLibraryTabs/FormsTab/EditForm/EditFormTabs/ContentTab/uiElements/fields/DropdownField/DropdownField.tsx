import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

function DropdownField({settings}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    return (
        <>
            <label>{settings.label}</label>
            <Dropdown {...settings} />
        </>
    );
}

export default DropdownField;
