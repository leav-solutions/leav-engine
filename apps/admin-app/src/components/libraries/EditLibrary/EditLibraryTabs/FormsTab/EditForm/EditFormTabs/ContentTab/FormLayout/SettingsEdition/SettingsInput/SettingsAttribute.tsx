// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import AttributeSelector from 'components/attributes/AttributeSelector';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, SettingsOnChangeFunc} from '../../../_types';

interface ISettingsAttributeProps {
    onChange: SettingsOnChangeFunc;
    settingsField: IFormElementSettings;
}

function SettingsAttribute({onChange, settingsField}: ISettingsAttributeProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings, library}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => onChange(data.name, data.value);

    return (
        <AttributeSelector
            key={settingsField.name}
            placeholder={t('forms.select_attribute')}
            name={settingsField.name}
            onChange={_handleChange}
            filters={{
                libraries: [library]
            }}
            value={String(elementInSettings?.settings?.attribute)}
        />
    );
}

export default SettingsAttribute;
