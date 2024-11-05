// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import useLang from 'hooks/useLang';

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
    const {lang: availableLangs} = useLang();

    const fieldProps = {
        label: localizedLabel(label, availableLangs)
    };

    return <StyledInput className={required ? 'required' : undefined} type={type} {...fieldProps} fluid />;
}

export default InputField;
