// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {DropdownItemProps, Select} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {ISettingsFieldCommonProps, TabsDirection} from '../../../../_types';

export interface ISettingsFieldSelectProps extends ISettingsFieldCommonProps {
    options: string[];
}

function SettingsSelect({onChange, fieldName, options, disabled}: ISettingsFieldSelectProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const dropdownOptions: DropdownItemProps[] = options.map(optionValue => ({
        key: optionValue,
        value: optionValue,
        text: t(`forms.settings.select_options.${optionValue}`)
    }));

    const _handleChange = (_, data) => onChange(data.name, data.value);

    return (
        <Select
            options={dropdownOptions}
            name={fieldName}
            disabled={disabled}
            value={String(elementInSettings?.settings?.[fieldName] || TabsDirection.HORIZONTAL)}
            onChange={_handleChange}
        />
    );
}

export default SettingsSelect;
