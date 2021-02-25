// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Checkbox} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, SettingsOnChangeFunc} from '../../../_types';

interface ISettingsCheckboxProps {
    onChange: SettingsOnChangeFunc;
    settingsField: IFormElementSettings;
}

function SettingsCheckbox({onChange, settingsField}: ISettingsCheckboxProps): JSX.Element {
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => onChange(data.name, data.checked);

    return (
        <Checkbox
            toggle
            name={settingsField.name}
            onChange={_handleChange}
            checked={!!elementInSettings?.settings?.[settingsField.name]}
        />
    );
}

export default SettingsCheckbox;
