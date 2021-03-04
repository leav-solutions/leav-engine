// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {DropdownItemProps, Select} from 'semantic-ui-react';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, SettingsOnChangeFunc, TabsDirection} from '../../../_types';

interface ISettingsSelectProps {
    onChange: SettingsOnChangeFunc;
    settingsField: IFormElementSettings;
}

function SettingsSelect({onChange, settingsField}: ISettingsSelectProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const options: DropdownItemProps[] = settingsField.options.map(optionValue => ({
        key: optionValue,
        value: optionValue,
        text: t(`forms.settings.select_options.${optionValue}`)
    }));

    const _handleChange = (_, data) => onChange(data.name, data.value);

    return (
        <Select
            options={options}
            name={settingsField.name}
            value={String(elementInSettings?.settings?.[settingsField.name] || TabsDirection.HORIZONTAL)}
            onChange={_handleChange}
        />
    );
}

export default SettingsSelect;
