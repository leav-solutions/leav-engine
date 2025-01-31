// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import Loading from 'components/shared/Loading';
import {getAttributeByIdQuery} from 'queries/attributes/getAttributeById';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form} from 'semantic-ui-react';
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
import SettingsAttribute, {ISettingsAttributeProps} from './SettingsInput/SettingsAttribute';
import SettingsCheckbox from './SettingsInput/SettingsCheckbox';
import SettingsRTE from './SettingsInput/SettingsRTE';
import SettingsSelect, {ISettingsFieldSelectProps} from './SettingsInput/SettingsSelect';
import SettingsTextInput from './SettingsInput/SettingsTextInput';

interface ISettingsFieldProps {
    settingsField: IFormElementSettings;
}

function SettingsField({settingsField}: ISettingsFieldProps): JSX.Element {
    const {t} = useTranslation();
    const {readonly} = useEditFormContext();
    const {
        state: {elementInSettings, library},
        dispatch
    } = useFormBuilderReducer();

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
    const _handleChange: SettingsOnChangeFunc = (name, value) => {
        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            settings: {
                [name]: value
            }
        });
    };

    if (settingsField.inputType === FormElementSettingsInputTypes.NONE) {
        return null;
    }

    let comp: JSX.Element;
    const compProps: ISettingsFieldCommonProps = {
        onChange: _handleChange,
        disabled: readonly,
        fieldName: settingsField.name,
        ...(settingsField.getInputSettings ? settingsField.getInputSettings(attributeProps) : null)
    };

    switch (settingsField.inputType) {
        case FormElementSettingsInputTypes.ATTRIBUTE_SELECTION:
            comp = <SettingsAttribute {...compProps} library={library} />;
            break;
        case FormElementSettingsInputTypes.ATTRIBUTE_SELECTION_MULTIPLE:
            comp = <SettingsAttribute {...(compProps as ISettingsAttributeProps)} />;
            break;
        case FormElementSettingsInputTypes.CHECKBOX:
            comp = <SettingsCheckbox {...compProps} />;
            break;
        case FormElementSettingsInputTypes.RTE:
            comp = <SettingsRTE {...compProps} />;
            break;
        case FormElementSettingsInputTypes.SELECT:
            comp = <SettingsSelect {...(compProps as ISettingsFieldSelectProps)} />;
            break;
        default:
            comp = <SettingsTextInput {...compProps} />;
    }

    return (
        <Form.Field key={settingsField.name}>
            <label>{t(`forms.settings.${settingsField.name}`)}</label>
            {comp}
        </Form.Field>
    );
}

export default SettingsField;
