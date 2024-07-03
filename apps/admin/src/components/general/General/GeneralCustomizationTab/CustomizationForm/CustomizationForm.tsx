// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import FileSelector from 'components/shared/FileSelector';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {GlobalSettingsInput} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {SAVE_GLOBAL_SETTINGS_saveGlobalSettings} from '_gqlTypes/SAVE_GLOBAL_SETTINGS';

interface ICustomizationFormProps {
    settings: GET_GLOBAL_SETTINGS_globalSettings;
    onSubmit: (settings: GlobalSettingsInput) => Promise<SAVE_GLOBAL_SETTINGS_saveGlobalSettings>;
}

function CustomizationForm({settings, onSubmit}: ICustomizationFormProps): JSX.Element {
    const {t} = useTranslation();
    const [name, setName] = useState(settings.name);

    const _handleChangeName = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const val = target.value;
        setName(val);
    };

    const _handleFileSelection = (field: keyof Pick<GlobalSettingsInput, 'icon' | 'favicon'>) => (
        selectedFile: RecordIdentity_whoAmI
    ) => {
        onSubmit({
            [field]: selectedFile
                ? {
                      library: selectedFile.library.id,
                      recordId: selectedFile.id
                  }
                : null
        });
    };

    const _handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLInputElement;
            target.blur(); // This will trigger submit
        }
    };

    const _handleSubmit = async (e: React.SyntheticEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const val = target.value;
        return onSubmit({[target.name]: val});
    };

    useEffect(() => {
        setName(settings.name);
    }, [settings.name]);

    return (
        <Form>
            <Form.Input
                type="text"
                name="name"
                aria-label="name"
                value={name}
                label={t('general.customization.name')}
                onBlur={_handleSubmit}
                onKeyPress={_handleKeyPress}
                onChange={_handleChangeName}
            />
            <Form.Field name="icon">
                <FileSelector
                    onChange={_handleFileSelection('icon')}
                    value={settings?.icon?.whoAmI}
                    label={t('general.customization.icon')}
                />
            </Form.Field>
            <Form.Field name="favicon">
                <FileSelector
                    onChange={_handleFileSelection('favicon')}
                    value={settings?.favicon?.whoAmI}
                    label={t('general.customization.favicon')}
                />
            </Form.Field>
        </Form>
    );
}

export default CustomizationForm;
