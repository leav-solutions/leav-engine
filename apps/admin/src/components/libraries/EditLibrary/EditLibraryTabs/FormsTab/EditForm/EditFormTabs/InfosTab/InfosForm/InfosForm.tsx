// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../../../../hooks/useLang';
import {arrayPick, formatIDString, getFieldError, omit, pick} from '../../../../../../../../../utils';
import {GET_FORM_forms_list} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {AttributeType, FormInput} from '../../../../../../../../../_gqlTypes/globalTypes';
import AttributeSelector from '../../../../../../../../attributes/AttributeSelector';
import FormFieldWrapper from '../../../../../../../../shared/FormFieldWrapper';
import {useEditFormModalButtonsContext} from '../../../../EditFormModal/useEditFormModalButtonsContext';
import {useEditFormContext} from '../../../hooks/useEditFormContext';

interface IInfosFormProps {
    onSubmit: (formData: FormInput) => void;
}

type FormValues = Pick<GET_FORM_forms_list, 'id' | 'system' | 'label' | 'sidePanel'> & {
    dependencyAttributes: string[];
};

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function InfosForm({onSubmit}: IInfosFormProps): JSX.Element {
    const {defaultLang, availableLangs} = useLang();
    const {form, library, readonly} = useEditFormContext();
    const {setButton, removeButton} = useEditFormModalButtonsContext();
    const submitFunc = useRef<() => void>();

    const existingForm = form !== null;
    const {t} = useTranslation();
    const defaultForm: FormValues = {
        id: '',
        system: false,
        label: null,
        dependencyAttributes: [],
        sidePanel: {
            enable: true,
            isOpenByDefault: false
        }
    };

    const [formValues, setFormValues] = useState<FormValues>(defaultForm);

    // This useEffect is used to transmit the submit button to parent modal when creating a new form
    useEffect(() => {
        if (readonly || existingForm) {
            return;
        }
        const buttonKey = 'saveForm';
        setButton(
            buttonKey,
            <Button key={buttonKey} type="submit" primary icon labelPosition="left" onClick={submitFunc.current}>
                <Icon name="save" />
                {t('admin.submit')}
            </Button>
        );

        return () => removeButton(buttonKey);
    }, [readonly, existingForm, library, form]);

    useEffect(() => {
        if (!form) {
            return;
        }

        setFormValues({
            ...pick(form as GET_FORM_forms_list, ['id', 'system', 'label', 'sidePanel']),
            dependencyAttributes: arrayPick(form?.dependencyAttributes || [], 'id')
        });
    }, [form]);

    const _handleSubmit = (values: FormValues) => {
        const valuesToSubmit: FormInput = {
            ...omit(values, ['system']),
            label: (values?.label as SystemTranslation) ?? null,
            library,
            ...(values?.sidePanel && {
                sidePanel: omit(values.sidePanel, [
                    '__typename' as keyof typeof values.sidePanel
                ]) as typeof values.sidePanel
            })
        };

        return onSubmit(valuesToSubmit);
    };

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        submitForm,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<FormValues>) => {
        submitFunc.current = handleSubmit;

        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');
            // On new attribute, automatically generate an ID based on label
            if (!existingForm && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (existingForm) {
                submitForm();
            }
        };

        const _handleBlur = (e: React.FocusEvent) => {
            if (!existingForm) {
                handleBlur(e);
            } else {
                submitForm();
            }
        };

        const _handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                submitForm();
            }
        };

        const {id, label, dependencyAttributes, sidePanel} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<FormValues>(fieldName, touched, {}, inputErrors);

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {availableLangs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                name={'label.' + lang}
                                aria-label={'label.' + lang}
                                disabled={readonly}
                                value={label?.[lang] || ''}
                                onChange={_handleLabelChange}
                                onBlur={_handleBlur}
                                onKeyPress={_handleKeyPress}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={existingForm || readonly}
                        name="id"
                        aria-label="id"
                        onChange={_handleChange}
                        onBlur={_handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('dependencyAttributes')}>
                    <AttributeSelector
                        label={t('forms.dependency_attributes')}
                        filters={{type: [AttributeType.tree], libraries: [library]}}
                        multiple
                        name="dependencyAttributes"
                        value={dependencyAttributes}
                        onChange={_handleChangeWithSubmit}
                        disabled={readonly}
                    />
                </FormFieldWrapper>
                <Form.Group grouped>
                    <label>{t('forms.side_panel.title')}</label>
                    <FormFieldWrapper error={_getErrorByField('sidePanel')}>
                        <Form.Checkbox
                            label={t('forms.side_panel.displayed')}
                            disabled={readonly}
                            width="8"
                            toggle
                            name="sidePanel.enable"
                            aria-label="sidePanel.enable"
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            checked={sidePanel.enable}
                        />
                    </FormFieldWrapper>
                    {sidePanel.enable && (
                        <FormFieldWrapper>
                            <Form.Select
                                label={t('forms.side_panel.default')}
                                disabled={readonly}
                                width="4"
                                name="sidePanel.isOpenByDefault"
                                aria-label="sidePanel.isOpenByDefault"
                                onChange={_handleChangeWithSubmit}
                                options={[
                                    {
                                        text: t('forms.side_panel.opened'),
                                        value: true
                                    },
                                    {
                                        text: t('forms.side_panel.closed'),
                                        value: false
                                    }
                                ]}
                                value={sidePanel.isOpenByDefault}
                            />
                        </FormFieldWrapper>
                    )}
                </Form.Group>
            </Form>
        );
    };

    return <Formik initialValues={formValues} onSubmit={_handleSubmit} render={_renderForm} enableReinitialize />;
}

export default InfosForm;
