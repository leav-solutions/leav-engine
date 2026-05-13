import React from 'react';
import {Checkbox} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type ISettingsFieldCommonProps} from '../../../../_types';

function SettingsCheckbox({onChange, fieldName, disabled}: ISettingsFieldCommonProps): JSX.Element {
    const {
        state: {elementInSettings},
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
