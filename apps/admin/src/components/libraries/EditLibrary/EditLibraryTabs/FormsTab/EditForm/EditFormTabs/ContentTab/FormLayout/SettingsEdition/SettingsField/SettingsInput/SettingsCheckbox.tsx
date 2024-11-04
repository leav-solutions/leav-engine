// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Checkbox} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {ISettingsFieldCommonProps} from '../../../../_types';

function SettingsCheckbox({onChange, fieldName, disabled}: ISettingsFieldCommonProps): JSX.Element {
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => onChange(data.name, data.checked);

    return (
        <Checkbox
            toggle
            name={fieldName}
            onChange={_handleChange}
            disabled={disabled}
            checked={!!elementInSettings?.settings?.[fieldName]}
        />
    );
}

export default SettingsCheckbox;
