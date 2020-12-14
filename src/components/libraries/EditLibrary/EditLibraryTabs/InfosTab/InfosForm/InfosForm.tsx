// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError, localizedLabel} from '../../../../../../utils';
import {GET_LIBRARIES_libraries_list} from '../../../../../../_gqlTypes/GET_LIBRARIES';
import {LibraryBehavior} from '../../../../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';

interface IInfosFormProps {
    library: GET_LIBRARIES_libraries_list | null;
    onSubmit: (formData: any) => void;
    readonly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

type LibraryFormValues = Omit<GET_LIBRARIES_libraries_list, 'gqlNames'>;

const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

// TODO: add validation, getfielderror on attribute
/* tslint:disable-next-line:variable-name */
const InfosForm = ({library, onSubmit, readonly, errors, onCheckIdExists}: IInfosFormProps): JSX.Element => {
    const {t} = useTranslation();
    const {availableLangs, defaultLang} = useLang();
    const existingLib = library !== null;

    const defaultLibrary: LibraryFormValues = {
        id: '',
        system: false,
        label: {
            fr: '',
            en: ''
        },
        behavior: LibraryBehavior.standard,
        attributes: [],
        permissions_conf: null,
        recordIdentityConf: {
            label: null,
            color: null,
            preview: null
        }
    };

    const initialValues: LibraryFormValues = library === null ? defaultLibrary : library;
    const libAttributesOptions = initialValues.attributes
        ? initialValues.attributes.map(a => ({
              key: a.id,
              value: a.id,
              text: localizedLabel(a.label, availableLangs) || a.id
          }))
        : [];
    libAttributesOptions.unshift({key: '', value: '', text: ''});

    const _handleSubmit = values => {
        onSubmit(values);
    };

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (!existingLib) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdExists);
    }

    const validationSchema: yup.ObjectSchema<Partial<LibraryFormValues>> = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || availableLangs[0]]: yup.string().required()
        }),
        id: idValidator,
        recordIdentityConf: yup.object().shape({
            label: yup.string().nullable(),
            color: yup.string().nullable(),
            preview: yup.string().nullable()
        })
    });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<LibraryFormValues>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (!existingLib && field === 'label' && subfield === process.env.REACT_APP_DEFAULT_LANG) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const {id, label, behavior, recordIdentityConf} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<GET_LIBRARIES_libraries_list>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const behaviorOptions = Object.values(LibraryBehavior).map(b => ({
            key: b,
            value: b,
            text: t(`libraries.behavior_${b}`)
        }));

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
                                value={label?.[lang] ?? ''}
                                onChange={_handleLabelChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={existingLib || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('behavior')}>
                    <Form.Select
                        label={t('libraries.behavior')}
                        disabled={existingLib || readonly}
                        name="behavior"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={behavior}
                        options={behaviorOptions}
                    />
                </FormFieldWrapper>
                <Form.Group grouped>
                    <label>{t('libraries.record_identity')}</label>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.label')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.label"
                            disabled={readonly}
                            label={t('libraries.record_identity_label')}
                            value={recordIdentityConf && recordIdentityConf.label ? recordIdentityConf.label : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.color')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.color"
                            disabled={readonly}
                            label={t('libraries.record_identity_color')}
                            value={recordIdentityConf && recordIdentityConf.color ? recordIdentityConf.color : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.preview')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.preview"
                            disabled={readonly}
                            label={t('libraries.record_identity_preview')}
                            value={recordIdentityConf && recordIdentityConf.preview ? recordIdentityConf.preview : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                </Form.Group>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button type="submit">{t('admin.submit')}</Form.Button>
                    </FormGroupWithMargin>
                )}
            </Form>
        );
    };
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={_handleSubmit}
            render={_renderForm}
            validationSchema={validationSchema}
        />
    );
};

export default InfosForm;
