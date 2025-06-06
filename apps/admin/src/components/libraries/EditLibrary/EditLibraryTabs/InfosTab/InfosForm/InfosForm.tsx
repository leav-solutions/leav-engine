// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import FileSelector from 'components/shared/FileSelector';
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError, isLinkAttribute, localizedLabel, isTreeAttribute} from '../../../../../../utils';
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

type LibraryFormValues = Omit<
    GET_LIB_BY_ID_libraries_list,
    'fullTextAttributes' | 'mandatoryAttribute' | 'defaultView'
> & {
    defaultView?: string | null;
    mandatoryAttribute: string | null;
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
        icon: null,
        behavior: LibraryBehavior.standard,
        mandatoryAttribute: null,
        attributes: [],
        permissions_conf: null,
        defaultView: null,
        fullTextAttributes: [],
        recordIdentityConf: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            treeColorPreview: null
        },
        settings: {},
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
                  mandatoryAttribute: library?.mandatoryAttribute?.id ?? null,
                  fullTextAttributes: library?.fullTextAttributes ? library.fullTextAttributes.map(a => a.id) : []
              };

    const mandatoryAttributeOptions = initialValues.attributes
        ? initialValues.attributes
              .filter(attr => isLinkAttribute(attr) || isTreeAttribute(attr))
              .map(attr => ({
                  key: attr.id,
                  value: attr.id,
                  text: localizedLabel(attr.label, lang)
              }))
        : [];
    mandatoryAttributeOptions.unshift({key: '', value: '', text: ''});

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

    const validationSchema = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || lang[0]]: yup.string().required()
        }),
        id: idValidator,
        recordIdentityConf: yup
            .object()
            .shape({
                label: yup.string().nullable(),
                subLabel: yup.string().nullable(),
                color: yup.string().nullable(),
                preview: yup.string().nullable(),
                treeColorPreview: yup.string().nullable()
            })
            .nullable()
    });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched,
        submitForm,
        isValid,
        isValidating,
        isSubmitting
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

        const _handleChange = async (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            await setFieldValue(name, value);
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (isExistingLib) {
                submitForm();
            }
        };

        const _handleBlur = (e: React.FocusEvent) => {
            if (!isExistingLib) {
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

        const _handleIconChange = async (selectedIcon: RecordIdentity_whoAmI) => {
            _handleChangeWithSubmit(null, {
                name: 'icon',
                value: {whoAmI: selectedIcon}
            });
        };

        const {id, label, behavior, mandatoryAttribute, recordIdentityConf, defaultView, fullTextAttributes} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<LibraryFormValues>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const behaviorOptions = Object.values(LibraryBehavior).map(b => ({
            key: b,
            value: b,
            text: t(`libraries.behavior_${b}`)
        }));

        const _onSubmit = () => handleSubmit();

        return (
            <Form onSubmit={_onSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {availableLangs.map(availableLang => (
                        <FormFieldWrapper key={availableLang} error={_getErrorByField(`label.${availableLang}`)}>
                            <Form.Input
                                label={`${availableLang} ${availableLang === defaultLang ? '*' : ''}`}
                                name={'label.' + availableLang}
                                aria-label={'label.' + availableLang}
                                disabled={readonly}
                                value={label?.[availableLang] ?? ''}
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
                        disabled={isExistingLib || readonly}
                        name="id"
                        aria-label="id"
                        onChange={_handleChange}
                        onBlur={_handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('behavior')}>
                    <Form.Select
                        label={t('libraries.behavior')}
                        disabled={isExistingLib || readonly}
                        name="behavior"
                        aria-label="behavior"
                        onChange={_handleChangeWithSubmit}
                        onBlur={_handleBlur}
                        value={behavior}
                        options={behaviorOptions}
                    />
                </FormFieldWrapper>
                {isExistingLib && (
                    <FormFieldWrapper error={_getErrorByField('libraries.mandatory_attribute')}>
                        <Form.Select
                            label={t('libraries.mandatory_attribute')}
                            name="mandatoryAttribute"
                            aria-label="mandatoryAttribute"
                            disabled={readonly}
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            value={mandatoryAttribute}
                            options={mandatoryAttributeOptions}
                        />
                    </FormFieldWrapper>
                )}
                {isExistingLib && (
                    <FormFieldWrapper error={_getErrorByField('libraries.fulltext_attributes')}>
                        <Form.Dropdown
                            search
                            selection
                            multiple
                            options={libAttributesOptions}
                            name="fullTextAttributes"
                            aria-label="fullTextAttributes"
                            disabled={readonly}
                            label={t('libraries.fulltext_attributes')}
                            value={fullTextAttributes}
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                        />
                    </FormFieldWrapper>
                )}
                {isExistingLib && (
                    <FormFieldWrapper error={_getErrorByField('defaultView')}>
                        <ViewSelector
                            search
                            selection
                            label={t('libraries.default_view')}
                            disabled={readonly}
                            name="defaultView"
                            aria-label="defaultView"
                            value={defaultView ?? ''}
                            library={library!.id}
                            onChange={_handleChangeWithSubmit}
                            onBlur={handleBlur}
                        />
                    </FormFieldWrapper>
                )}
                {isExistingLib && (
                    <Form.Group grouped disabled={!isExistingLib || readonly}>
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
                                onChange={_handleChangeWithSubmit}
                            />
                        </FormFieldWrapper>
                        <FormFieldWrapper error={_getErrorByField('recordIdentityConf.subLabel')}>
                            <Form.Dropdown
                                search
                                selection
                                options={libAttributesOptions}
                                name="recordIdentityConf.subLabel"
                                disabled={readonly}
                                label={t('libraries.record_identity_sub_label')}
                                value={recordIdentityConf?.subLabel ?? ''}
                                onChange={_handleChangeWithSubmit}
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
                                onChange={_handleChangeWithSubmit}
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
                                value={
                                    recordIdentityConf && recordIdentityConf.preview ? recordIdentityConf.preview : ''
                                }
                                onChange={_handleChangeWithSubmit}
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
                                onChange={_handleChangeWithSubmit}
                            />
                        </FormFieldWrapper>
                    </Form.Group>
                )}
                <FormFieldWrapper error={_getErrorByField('icon.whoAmI')}>
                    <FileSelector
                        onChange={_handleIconChange}
                        value={values.icon?.whoAmI ?? null}
                        label={t('applications.icon')}
                    />
                </FormFieldWrapper>
                {!readonly && !isExistingLib && (
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
