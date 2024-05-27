// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import FormFieldWrapper from 'components/shared/FormFieldWrapper';
import RecordSelector from 'components/shared/RecordSelector';
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import {getFieldError} from 'utils';
import * as yup from 'yup';
import {GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';
import {ApiKeyInput} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {IFormError} from '_types/errors';
import ExpirationSelector from './ExpirationSelector';

const FormWrapper = styled(Form)<{$isNewKey: boolean}>`
    && {
        position: unset;
        height: 100%;
    }
`;

const FormBody = styled.div`
    overflow-y: auto;
    height: 100%;
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
    align-items: flex-start;
    gap: 0.5rem;
`;

interface IEditApiKeyFormProps {
    onSubmit: (apiKey: ApiKeyInput) => void;
    apiKey: GET_API_KEYS_apiKeys_list;
    errors?: IFormError;
    readonly: boolean;
    loading: boolean;
    onClose: () => void;
}

interface IEditApiKeyFormValues extends Omit<ApiKeyInput, 'userId'> {
    user: RecordIdentity_whoAmI;
}

function EditApiKeyForm({onSubmit, apiKey, errors, readonly, loading, onClose}: IEditApiKeyFormProps): JSX.Element {
    const {t} = useTranslation();

    const isNewKey = !apiKey?.id;

    // @ts-ignore
    const validationSchema: yup.ObjectSchema<IEditApiKeyFormValues> = yup.object().shape({
        label: yup.string().nullable().required(),
        expiresAt: yup.number().nullable(),
        user: yup.object().nullable().required()
    });

    const initialValues: IEditApiKeyFormValues = {
        label: apiKey?.label ?? null,
        expiresAt: apiKey?.expiresAt ?? null,
        user: apiKey?.user?.whoAmI ?? null
    };

    const _handleSubmit = async (values: IEditApiKeyFormValues) => {
        const apiKeyInput: ApiKeyInput = {
            id: apiKey?.id ?? null,
            label: values.label,
            expiresAt: values.expiresAt,
            userId: values.user.id
        };

        await onSubmit(apiKeyInput);
    };

    const _handleClose = () => onClose();
    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched,
        submitForm
    }: FormikProps<IEditApiKeyFormValues>) => {
        const serverValidationErrors =
            errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

        const _handleChange = async (e, data) => {
            await setFieldValue(data.name, data.value);
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (!isNewKey) {
                submitForm();
            }
        };

        const _handleBlur = (e: React.FocusEvent) => {
            if (isNewKey) {
                handleBlur(e);
            } else {
                submitForm();
            }
        };

        const _handleUserChange = async (user: RecordIdentity_whoAmI) => {
            await _handleChangeWithSubmit(null, {name: 'user', value: user});
        };

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<ApiKeyInput>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const _handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                submitForm();
            }
        };

        const _onSubmit = () => handleSubmit();

        return (
            <FormWrapper onSubmit={_onSubmit} aria-label="infos-form" $isNewKey={isNewKey}>
                <FormBody>
                    <Form.Group grouped>
                        <FormFieldWrapper error={_getErrorByField('label')}>
                            <Form.Input
                                label={t('admin.label')}
                                width="4"
                                name="label"
                                aria-label="label"
                                disabled={readonly}
                                onChange={_handleChange}
                                onBlur={_handleBlur}
                                onKeyPress={_handleKeyPress}
                                value={values.label ?? ''}
                            />
                        </FormFieldWrapper>
                        <Form.Group grouped>
                            <FormFieldWrapper error={_getErrorByField('expiresAt')}>
                                <ExpirationSelector
                                    value={values.expiresAt}
                                    required
                                    label={t('api_keys.expiresAt')}
                                    width="6"
                                    name="expiresAt"
                                    aria-label="expiresAt"
                                    disabled={readonly}
                                    onChange={_handleChangeWithSubmit}
                                    onBlur={_handleBlur}
                                    onKeyPress={_handleKeyPress}
                                    placeholder={t('api_keys.select_expiration_date')}
                                    fluid
                                />
                            </FormFieldWrapper>
                        </Form.Group>
                        <FormFieldWrapper error={_getErrorByField('user')}>
                            <RecordSelector
                                onChange={_handleUserChange}
                                value={values.user ?? null}
                                label={t('api_keys.user')}
                                libraries={['users']}
                                required
                            />
                        </FormFieldWrapper>
                    </Form.Group>
                </FormBody>
                <FormFooter>
                    <Button className="close-button" onClick={_handleClose}>
                        <Icon name="cancel" /> {t('admin.close')}
                    </Button>
                    {isNewKey && (
                        <Button labelPosition="left" icon type="submit" primary disabled={readonly} loading={loading}>
                            <Icon name="save" />
                            {t('admin.submit')}
                        </Button>
                    )}
                </FormFooter>
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

export default EditApiKeyForm;
