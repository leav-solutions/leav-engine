// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {ISettingsFieldCommonProps} from '../../../../_types';

function SettingsTextInput({onChange, fieldName}: ISettingsFieldCommonProps): JSX.Element {
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => {
        onChange(data.name, data.value);
    };

    return (
        <Input
            type="text"
            name={fieldName}
            id={fieldName}
            onChange={_handleChange}
            value={elementInSettings?.settings?.[fieldName] || ''}
        />
    );
}

export default SettingsTextInput;
