// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, SettingsOnChangeFunc} from '../../../_types';

interface ISettingsTextInputProps {
    onChange: SettingsOnChangeFunc;
    settingsField: IFormElementSettings;
}

function SettingsTextInput({onChange, settingsField}: ISettingsTextInputProps): JSX.Element {
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => {
        onChange(data.name, data.value);
    };

    return (
        <Input
            type="text"
            name={settingsField.name}
            id={settingsField.name}
            onChange={_handleChange}
            value={elementInSettings?.settings?.[settingsField.name] || ''}
        />
    );
}

export default SettingsTextInput;
