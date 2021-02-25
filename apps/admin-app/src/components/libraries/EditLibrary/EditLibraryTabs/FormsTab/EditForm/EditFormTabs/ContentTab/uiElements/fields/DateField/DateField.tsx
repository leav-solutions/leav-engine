// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input} from 'semantic-ui-react';
import styled from 'styled-components';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

const DateInput = styled(Input)`
    && {
        flex-grow: 0;
    }
`;

const TimeInput = styled(Input)`
    && {
        margin-left: 0.5em;
        flex-grow: 0;
    }
`;

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
            <DateInput data-test-id="date-field" type="date" {...fieldProps} />
            {withTime && <TimeInput data-test-id="time-field" type="time" />}
        </>
    );
}

export default DateField;
