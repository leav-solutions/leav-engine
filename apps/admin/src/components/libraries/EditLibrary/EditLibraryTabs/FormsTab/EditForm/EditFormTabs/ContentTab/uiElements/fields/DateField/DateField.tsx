import {Input} from 'semantic-ui-react';
import styled from 'styled-components';
import {type ICommonFieldsSettings, type IFormElementProps} from '../../../_types';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';

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
    const {label, withTime = false} = props.settings;
    const {lang: availableLangs} = useLang();

    const fieldProps = {
        label: localizedLabel(label, availableLangs),
    };

    return (
        <>
            <DateInput data-test-id="date-field" type="date" {...fieldProps} />
            {withTime && <TimeInput data-test-id="time-field" type="time" />}
        </>
    );
}

export default DateField;
