// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
