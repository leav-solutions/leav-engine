// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import Loading from 'components/shared/Loading';
import {getAttributeByIdQuery} from 'queries/attributes/getAttributeById';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Input} from 'semantic-ui-react';
import {GET_ATTRIBUTE_BY_ID, GET_ATTRIBUTE_BY_IDVariables} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, ISettingsFieldCommonProps} from '../../../_types';
import useLang from 'hooks/useLang';

interface ISettingsFieldProps {
    settingsField: IFormElementSettings;
}

function SettingsField({settingsField}: ISettingsFieldProps) {
    const {t} = useTranslation();
    const {defaultLang, availableLangs} = useLang();
    const {readonly} = useEditFormContext();
    const {
        state: {elementInSettings},
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
                <Form.Field key={lang}>
                    <label>{`${lang} ${lang === defaultLang ? '*' : ''}`}</label>
                    <Input
                        type="text"
                        name={compProps.fieldName}
                        id={compProps.fieldName}
                        disabled={compProps.disabled}
                        onChange={_handleChange(lang)}
                        value={values[lang] ?? ''}
                    />
                </Form.Field>
            ))}
        </Form.Group>
    );
}

export default SettingsField;
