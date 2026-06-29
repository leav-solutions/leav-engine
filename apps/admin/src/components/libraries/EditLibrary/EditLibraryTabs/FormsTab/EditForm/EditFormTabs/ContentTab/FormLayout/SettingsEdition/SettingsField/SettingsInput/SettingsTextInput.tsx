import {Input} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type ISettingsFieldCommonProps} from '../../../../_types';

function SettingsTextInput({onChange, fieldName, disabled}: ISettingsFieldCommonProps): JSX.Element {
    const {
        state: {elementInSettings},
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => {
        onChange(data.name, data.value);
    };

    return (
        <Input
            type="text"
            name={fieldName}
            id={fieldName}
            disabled={disabled}
            onChange={_handleChange}
            value={elementInSettings?.settings?.[fieldName] || ''}
        />
    );
}

export default SettingsTextInput;
