import {useTranslation} from 'react-i18next';
import {type DropdownItemProps, Select} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type ISettingsFieldCommonProps, TabsDirection} from '../../../../_types';

export interface ISettingsFieldSelectProps extends ISettingsFieldCommonProps {
    options: string[];
}

function SettingsSelect({
    onChange,
    fieldName,
    options,
    disabled,
    defaultValue,
}: ISettingsFieldSelectProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings},
    } = useFormBuilderReducer();

    const dropdownOptions: DropdownItemProps[] = options.map(optionValue => ({
        key: optionValue,
        value: optionValue,
        text: t(`forms.settings.select_options.${optionValue}`),
    }));

    const _handleChange = (_, data) => onChange(data.name, data.value);

    return (
        <Select
            options={dropdownOptions}
            name={fieldName}
            disabled={disabled}
            value={String(elementInSettings?.settings?.[fieldName] || defaultValue || TabsDirection.HORIZONTAL)}
            onChange={_handleChange}
        />
    );
}

export default SettingsSelect;
