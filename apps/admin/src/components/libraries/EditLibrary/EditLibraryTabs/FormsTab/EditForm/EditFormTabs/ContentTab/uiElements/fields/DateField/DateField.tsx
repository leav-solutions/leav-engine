// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input} from 'semantic-ui-react';
import styled from 'styled-components';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';
import useLang from 'hooks/useLang';
import {localizedLabel} from 'utils';

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

const defaulLabel = {en: 'Date'};

function DateField(props: IFormElementProps<IDateFieldSettings>): JSX.Element {
    const {label = defaulLabel, withTime = false} = props.settings;
    const {lang: availableLangs} = useLang();

    const _fieldProps = {
        label: localizedLabel(label, availableLangs)
    };

    return (
        <>
            <DateInput data-test-id="date-field" type="date" {..._fieldProps} />
            {withTime && <TimeInput data-test-id="time-field" type="time" />}
        </>
    );
}

export default DateField;
