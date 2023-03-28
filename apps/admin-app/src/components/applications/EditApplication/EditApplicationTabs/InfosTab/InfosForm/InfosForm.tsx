// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, FormProps, Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import {ApplicationType} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError} from '../../../../../../utils';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import FileSelector from '../../../../../shared/FileSelector';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';
import {ApplicationInfosFormValues} from '../_types';
import ModuleSelector from './ModuleSelector';

interface IInfosFormProps {
    onSubmitInfos: (dataToSave: ApplicationInfosFormValues) => void;
    loading: boolean;
    errors?: IFormError;
    onCheckIdIsUnique: (value: string) => Promise<boolean>;
}

const FormWrapper = styled(({isNewApp, ...props}: {isNewApp: boolean} & FormProps) => <Form {...props} />)`
    && {
        position: unset;
        display: grid;
        grid-template-rows: ${props => (props.isNewApp ? 'auto 6rem' : 'auto')};
    }
`;

const FormBody = styled.div`
    overflow-y: auto;
`;

const FormFooter = styled.div`
    border-top: 1px solid #dddddd;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1em;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

const InstallMessage = styled.div`
    margin-right 1em;
    color: #999;
`;

function InfosForm({onSubmitInfos, errors, onCheckIdIsUnique, loading}: IInfosFormProps): JSX.Element {
    const {t} = useTranslation();
    const {application, readonly} = useEditApplicationContext();
    const {availableLangs, defaultLang} = useLang();
    const isReadOnly = readonly || loading;

    const defaultApplicationData: ApplicationInfosFormValues = {
        id: '',
        type: ApplicationType.internal,
        color: '',
        icon: null,
        module: '',
        label: availableLangs.reduce((acc, cur) => {
            acc[cur] = '';
            return acc;
        }, {}),
        description: availableLangs.reduce((acc, cur) => {
            acc[cur] = '';
            return acc;
        }, {}),
        endpoint: ''
    };

    const isNewApp = !application;
    const initialValues: ApplicationInfosFormValues = {
        ...defaultApplicationData,
        ...application
    };

    const _handleSubmit = (values: ApplicationInfosFormValues) => {
        onSubmitInfos(values);
    };

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (isNewApp) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdIsUnique);
    }

    // @ts-ignore
    const validationSchema: yup.ObjectSchema<Override<ApplicationInfosFormValues, {type: string}>> = yup
        .object()
        .shape({
            id: idValidator,
            type: yup.string().oneOf(Object.values(ApplicationType)),
            color: yup.string().nullable(),
            icon: yup
                .object()
                .shape({
                    whoAmI: yup
                        .object({
                            id: yup.string(),
                            label: yup.string().nullable(),
                            color: yup.string().nullable(),
                            library: yup.object().shape({id: yup.string(), label: yup.object()}),
                            preview: yup.object().nullable()
                        })
                        .nullable()
                })
                .nullable(),
            module: yup.string(),
            label: yup.object().shape({
                [defaultLang]: yup.string().required()
            }),
            description: yup
                .object()
                .shape({
                    [defaultLang]: yup.string()
                })
                .nullable(),
            endpoint: yup.string().required()
        });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched,
        submitForm
    }: FormikProps<ApplicationInfosFormValues>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (isNewApp && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = async (e, data) => {
            const isCheckbox = data.type === 'checkbox';
            const value = isCheckbox ? data.checked : data.value;
            const name: string = data.name;

            await setFieldValue(name, value);
        };

        const _handleChangeNoLibraries = async (e, data) => {
            const value = data.checked;

            await setFieldValue('libraries', value ? null : []);

            if (!isNewApp) {
                submitForm();
            }
        };

        const _handleChangeNoTrees = async (e, data) => {
            const value = data.checked;

            await setFieldValue('trees', value ? null : []);

            if (!isNewApp) {
                submitForm();
            }
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (!isNewApp) {
                submitForm();
            }
        };

        const _handleIconChange = async (selectedIcon: RecordIdentity_whoAmI) => {
            _handleChangeWithSubmit(null, {
                name: 'icon',
                value: {whoAmI: selectedIcon}
            });
        };

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<ApplicationInfosFormValues>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const _handleBlur = (e: React.FocusEvent) => {
            if (isNewApp) {
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

        const _onSubmit = () => {
            return handleSubmit();
        };

        return (
            <FormWrapper onSubmit={_onSubmit} aria-label="infos-form" isNewApp={isNewApp}>
                <FormBody>
                    <Form.Group grouped>
                        <label>{t('admin.label')}</label>
                        {availableLangs.map(lang => (
                            <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                                <Form.Input
                                    required={lang === defaultLang}
                                    label={lang}
                                    width="4"
                                    name={`label.${lang}`}
                                    aria-label={`label.${lang}`}
                                    disabled={isReadOnly}
                                    onChange={_handleLabelChange}
                                    onBlur={_handleBlur}
                                    onKeyPress={_handleKeyPress}
                                    value={values.label?.[lang] ?? ''}
                                />
                            </FormFieldWrapper>
                        ))}
                    </Form.Group>
                    <Form.Group grouped>
                        <label>{t('admin.description')}</label>
                        {availableLangs.map(lang => (
                            <FormFieldWrapper key={lang} error={_getErrorByField(`description.${lang}`)}>
                                <Form.Input
                                    label={lang}
                                    value={values.description?.[lang] ?? ''}
                                    width="4"
                                    name={`description.${lang}`}
                                    aria-label={`description.${lang}`}
                                    disabled={isReadOnly}
                                    onChange={_handleChange}
                                    onBlur={_handleBlur}
                                    onKeyPress={_handleKeyPress}
                                />
                            </FormFieldWrapper>
                        ))}
                    </Form.Group>
                    <FormFieldWrapper error={_getErrorByField('id')}>
                        <Form.Input
                            required
                            label={t('admin.id')}
                            width="4"
                            disabled={!isNewApp || isReadOnly}
                            name="id"
                            aria-label="id"
                            onChange={_handleChange}
                            onBlur={_handleBlur}
                            value={values.id}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('type')}>
                        <Form.Select
                            required
                            label={t('applications.type')}
                            width="4"
                            disabled={!isNewApp || isReadOnly}
                            name="type"
                            aria-label="type"
                            onChange={_handleChangeWithSubmit}
                            options={Object.keys(ApplicationType).map(appType => {
                                return {
                                    text: t('applications.types.' + appType),
                                    value: appType
                                };
                            })}
                            value={values.type}
                        />
                    </FormFieldWrapper>
                    {values.type === ApplicationType.internal && (
                        <FormFieldWrapper error={_getErrorByField('module')}>
                            <ModuleSelector
                                required
                                label={t('applications.module')}
                                placeholder={t('applications.select_module')}
                                fluid
                                selection
                                width="4"
                                disabled={isReadOnly}
                                name="module"
                                aria-label="id"
                                onChange={_handleChangeWithSubmit}
                                onBlur={_handleBlur}
                                value={values.module}
                            />
                        </FormFieldWrapper>
                    )}
                    <FormFieldWrapper error={_getErrorByField('endpoint')}>
                        <Form.Input
                            required
                            label={t('applications.endpoint')}
                            width="4"
                            disabled={isReadOnly}
                            name="endpoint"
                            aria-label="endpoint"
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            value={values.endpoint}
                        />
                    </FormFieldWrapper>
                    {values.type === ApplicationType.internal && (
                        <>
                            <FormFieldWrapper error={_getErrorByField('icon.whoAmI')}>
                                <FileSelector
                                    onChange={_handleIconChange}
                                    value={values.icon?.whoAmI ?? null}
                                    label={t('applications.icon')}
                                />
                            </FormFieldWrapper>
                        </>
                    )}
                </FormBody>
                {!readonly && isNewApp && (
                    <FormFooter>
                        {isNewApp && loading && <InstallMessage>{t('applications.install_pending')}</InstallMessage>}
                        <Form.Button
                            type="submit"
                            primary
                            icon
                            loading={loading}
                            data-test-id="attribute-infos-submit-btn"
                            style={{float: 'right'}}
                            labelPosition="left"
                        >
                            <Icon name="save outline" />
                            {t('admin.submit')}
                        </Form.Button>
                    </FormFooter>
                )}
            </FormWrapper>
        );
    };

    return (
        <>
            {errors?.extensions.code === ErrorTypes.PERMISSION_ERROR && (
                <Message negative>
                    <Message.Header>
                        <Icon name="ban" /> {errors.message}
                        <Icon aria-label="ban" /> {errors.message}
                    </Message.Header>
                </Message>
            )}
            <Formik
                initialValues={initialValues}
                onSubmit={_handleSubmit}
                validateOnChange
                validationSchema={validationSchema}
            >
                {_renderForm}
            </Formik>
        </>
    );
}

export default InfosForm;
