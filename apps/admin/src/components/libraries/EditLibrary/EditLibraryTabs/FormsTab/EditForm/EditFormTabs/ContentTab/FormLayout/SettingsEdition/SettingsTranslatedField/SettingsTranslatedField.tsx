// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Loading from '../../../../../../../../../../shared/Loading';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Input} from 'semantic-ui-react';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type IFormElementSettings, type ISettingsFieldCommonProps} from '../../../_types';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {useGetAttributeByIdQuery} from '../../../../../../../../../../../_gqlTypes';
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../../../../../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';

interface ISettingsFieldProps {
    settingsField: IFormElementSettings;
}

function SettingsField({settingsField}: ISettingsFieldProps) {
    const {t} = useTranslation();
    const {defaultLang, availableLangs} = useLang();
    const {readonly} = useEditFormContext();
    const {
        state: {elementInSettings},
        dispatch,
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

    const {loading, error, data} = useGetAttributeByIdQuery({
        variables: {
            id: String(elementInSettings.settings?.attribute),
        },
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
                        [name]: value,
                    },
                },
            });
        };

    const compProps: ISettingsFieldCommonProps = {
        onChange: _handleChange,
        disabled: readonly,
        fieldName: settingsField.name,
        ...(settingsField.getInputSettings
            ? settingsField.getInputSettings(attributeProps as GET_ATTRIBUTE_BY_ID_attributes_list)
            : null),
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
