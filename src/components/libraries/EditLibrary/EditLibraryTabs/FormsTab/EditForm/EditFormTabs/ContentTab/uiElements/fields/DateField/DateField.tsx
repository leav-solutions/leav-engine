// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

interface IDateFieldSettings extends ICommonFieldsSettings {
    withTime?: boolean;
}

function DateField(props: IFormElementProps<IDateFieldSettings>): JSX.Element {
    const {label = 'Date', withTime = false} = props.settings;
    const fieldProps = {
        label
    };

    return (
        <>
            <Input data-test-id="date-field" type="date" {...fieldProps} fluid />
            {withTime && <Input data-test-id="time-field" type="time" />}
        </>
    );
}

export default DateField;
