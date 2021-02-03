// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../../../../hooks/useLang';
import {arrayPick, formatIDString, getFieldError, omit, pick} from '../../../../../../../../../utils';
import {GET_FORM_forms_list} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {AttributeType, FormInput} from '../../../../../../../../../_gqlTypes/globalTypes';
import AttributeSelector from '../../../../../../../../attributes/AttributeSelector';
import FormFieldWrapper from '../../../../../../../../shared/FormFieldWrapper';

interface IInfosFormProps {
    form: GET_FORM_forms_list | null;
    library: string;
    readonly?: boolean;
    onSubmit: (formData: FormInput) => void;
}

type FormValues = Pick<GET_FORM_forms_list, 'id' | 'system' | 'label'> & {
    dependencyAttributes: string[];
};

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function InfosForm({form, library, readonly, onSubmit}: IInfosFormProps): JSX.Element {
    const {defaultLang, availableLangs} = useLang();
    const {t} = useTranslation();
    const existingForm = form !== null;

    const defaultForm: FormValues = {
        id: '',
        system: false,
        label: null,
        dependencyAttributes: []
    };

    const initialValues: FormValues = existingForm
        ? {
              ...pick(form as GET_FORM_forms_list, ['id', 'system', 'label']),
              dependencyAttributes: arrayPick(form?.dependencyAttributes || [], 'id')
          }
        : defaultForm;

    const _handleSubmit = (values: FormValues) => {
        const valuesToSubmit: FormInput = {
            ...omit(values, ['system']),
            label: (values?.label as SystemTranslation) ?? null,
            library
        };

        return onSubmit(valuesToSubmit);
    };

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<FormValues>) => {
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

        const {id, label, dependencyAttributes} = values;

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
                                disabled={readonly}
                                value={label?.[lang] || ''}
                                onChange={_handleLabelChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={existingForm || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('dependencyAttributes')}>
                    <AttributeSelector
                        label={t('forms.dependency_attributes')}
                        filters={{type: [AttributeType.tree]}}
                        multiple
                        name="dependencyAttributes"
                        value={dependencyAttributes}
                        onChange={_handleChange}
                    />
                </FormFieldWrapper>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button type="submit">{t('admin.submit')}</Form.Button>
                    </FormGroupWithMargin>
                )}
            </Form>
        );
    };

    return <Formik initialValues={initialValues} onSubmit={_handleSubmit} render={_renderForm} />;
}

export default InfosForm;
