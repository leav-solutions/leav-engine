// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError, localizedLabel} from '../../../../../../utils';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, LibraryBehavior} from '../../../../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';
import ViewSelector from '../../../../../views/ViewSelector';

interface IInfosFormProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    onSubmit: (formData: any) => void;
    readonly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

type LibraryFormValues = Omit<GET_LIB_BY_ID_libraries_list, 'gqlNames' | 'fullTextAttributes' | 'defaultView'> & {
    defaultView?: string | null;
    fullTextAttributes: string[];
};

const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

// TODO: add validation, getfielderror on attribute
/* tslint:disable-next-line:variable-name */
const InfosForm = ({library, onSubmit, readonly, errors, onCheckIdExists}: IInfosFormProps): JSX.Element => {
    const {t} = useTranslation();
    const {defaultLang, availableLangs, lang} = useLang();
    const isExistingLib = library !== null;

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
        defaultView: null,
        fullTextAttributes: [],
        recordIdentityConf: {
            label: null,
            color: null,
            preview: null,
            treeColorPreview: null
        },
        permissions: {
            admin_library: true,
            access_library: true,
            access_record: true,
            create_record: true,
            edit_record: true,
            delete_record: true
        }
    };

    const initialValues: LibraryFormValues =
        library === null
            ? defaultLibrary
            : {
                  ...library,
                  defaultView: library?.defaultView?.id ?? null,
                  fullTextAttributes: library?.fullTextAttributes ? library.fullTextAttributes.map(a => a.id) : []
              };

    const libAttributesOptions = initialValues.attributes
        ? initialValues.attributes.map(a => ({
              key: a.id,
              value: a.id,
              text: localizedLabel(a.label, lang) || a.id
          }))
        : [];

    const libTreeAttributesOptions = library?.attributes
        ? library.attributes
              .filter(a => a.type === AttributeType.tree)
              .map(a => ({
                  key: a.id,
                  value: a.id,
                  text: localizedLabel(a.label, lang) || a.id
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

    if (!isExistingLib) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdExists);
    }

    const validationSchema: yup.ObjectSchema<Partial<LibraryFormValues>> = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || lang[0]]: yup.string().required()
        }),
        id: idValidator,
        recordIdentityConf: yup.object().shape({
            label: yup.string().nullable(),
            color: yup.string().nullable(),
            preview: yup.string().nullable(),
            treeColorPreview: yup.string().nullable()
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
            if (!isExistingLib && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const {id, label, behavior, recordIdentityConf, defaultView, fullTextAttributes} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<LibraryFormValues>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const behaviorOptions = Object.values(LibraryBehavior).map(b => ({
            key: b,
            value: b,
            text: t(`libraries.behavior_${b}`)
        }));

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {availableLangs.map(availableLang => (
                        <FormFieldWrapper key={availableLang} error={_getErrorByField(`label.${availableLang}`)}>
                            <Form.Input
                                label={`${availableLang} ${availableLang === defaultLang ? '*' : ''}`}
                                name={'label.' + availableLang}
                                disabled={readonly}
                                value={label?.[availableLang] ?? ''}
                                onChange={_handleLabelChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={isExistingLib || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('behavior')}>
                    <Form.Select
                        label={t('libraries.behavior')}
                        disabled={isExistingLib || readonly}
                        name="behavior"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={behavior}
                        options={behaviorOptions}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('libraries.fulltext_attributes')}>
                    <Form.Dropdown
                        search
                        selection
                        multiple
                        options={libAttributesOptions}
                        name="fullTextAttributes"
                        disabled={readonly}
                        label={t('libraries.fulltext_attributes')}
                        value={fullTextAttributes}
                        onChange={_handleChange}
                    />
                </FormFieldWrapper>
                {isExistingLib && (
                    <FormFieldWrapper error={_getErrorByField('defaultView')}>
                        <ViewSelector
                            search
                            selection
                            label={t('libraries.default_view')}
                            disabled={readonly}
                            name="defaultView"
                            value={defaultView ?? ''}
                            library={library!.id}
                            onChange={_handleChange}
                            onBlur={handleBlur}
                        />
                    </FormFieldWrapper>
                )}
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
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.preview')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libTreeAttributesOptions}
                            name="recordIdentityConf.treeColorPreview"
                            disabled={readonly}
                            label={t('libraries.record_identity_dependent_color_and_preview')}
                            value={
                                recordIdentityConf && recordIdentityConf.treeColorPreview
                                    ? recordIdentityConf.treeColorPreview
                                    : ''
                            }
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                </Form.Group>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button icon primary type="submit" labelPosition="left">
                            <Icon name="save" />
                            {t('admin.submit')}
                        </Form.Button>
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
