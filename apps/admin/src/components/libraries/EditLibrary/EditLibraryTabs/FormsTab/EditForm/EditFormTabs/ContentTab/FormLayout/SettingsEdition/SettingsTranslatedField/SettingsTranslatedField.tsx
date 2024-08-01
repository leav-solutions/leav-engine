// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import Loading from 'components/shared/Loading';
import {getAttributeByIdQuery} from 'queries/attributes/getAttributeById';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Input} from 'semantic-ui-react';
import {GET_ATTRIBUTE_BY_ID, GET_ATTRIBUTE_BY_IDVariables} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {
    FormElementSettingsInputTypes,
    IFormElementSettings,
    ISettingsFieldCommonProps,
    SettingsOnChangeFunc
} from '../../../_types';
import SettingsAttribute, {ISettingsAttributeProps} from '../SettingsField/SettingsInput/SettingsAttribute';
import SettingsCheckbox from '../SettingsField/SettingsInput/SettingsCheckbox';
import SettingsRTE from '../SettingsField/SettingsInput/SettingsRTE';
import SettingsSelect, {ISettingsFieldSelectProps} from '../SettingsField/SettingsInput/SettingsSelect';
import SettingsTextInput from '../SettingsField/SettingsInput/SettingsTextInput';
import useLang from 'hooks/useLang';
import FormFieldWrapper from 'components/shared/FormFieldWrapper';

interface ISettingsFieldProps {
    settingsField: IFormElementSettings;
}

function SettingsField({settingsField}: ISettingsFieldProps): JSX.Element {
    const {t} = useTranslation();
    const {defaultLang, availableLangs} = useLang();
    const {readonly} = useEditFormContext();
    const {
        state: {elementInSettings, library},
        dispatch
    } = useFormBuilderReducer();

    const values = useMemo(() => {
        const langValues = {};
        availableLangs.forEach(lang => {
            langValues[lang] =
                elementInSettings?.settings?.[settingsField.name]?.[lang] ||
                (lang === defaultLang ? elementInSettings?.settings?.[settingsField.name] : null);
        });
        return langValues;
    }, [elementInSettings?.settings]);

    const {loading, error, data} = useQuery<GET_ATTRIBUTE_BY_ID, GET_ATTRIBUTE_BY_IDVariables>(getAttributeByIdQuery, {
        variables: {
            id: String(elementInSettings.settings?.attribute)
        }
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">{error.message}</div>;
    }

    const attributeProps = data?.attributes?.list?.[0];
    const _handleChange =
        name =>
        (_, {value}) => {
            dispatch({
                type: FormBuilderActionTypes.SAVE_SETTINGS,
                settings: {
                    [settingsField.name]: {
                        ...values,
                        [name]: value
                    }
                }
            });
        };

    let comp: JSX.Element;
    const compProps: ISettingsFieldCommonProps = {
        onChange: _handleChange,
        disabled: readonly,
        fieldName: settingsField.name,
        ...(settingsField.getInputSettings ? settingsField.getInputSettings(attributeProps) : null)
    };

    return (
        <Form.Group grouped>
            <label>{t(`forms.settings.${settingsField.name}`)}</label>
            {availableLangs.map(lang => (
                <FormFieldWrapper key={lang}>
                    <label>{`${lang} ${lang === defaultLang ? '*' : ''}`}</label>
                    <Input
                        type="text"
                        name={compProps.fieldName}
                        id={compProps.fieldName}
                        disabled={compProps.disabled}
                        onChange={_handleChange(lang)}
                        value={values[lang] ?? ''}
                    />
                </FormFieldWrapper>
            ))}
        </Form.Group>
    );

    return (
        <Form.Field key={settingsField.name}>
            <label>{t(`forms.settings.${settingsField.name}`)}</label>
            {comp}
        </Form.Field>
    );
}

export default SettingsField;
