// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import FormFieldWrapper from 'components/shared/FormFieldWrapper';
import TreesSelector from 'components/trees/TreesSelector';
import {Formik, FormikProps} from 'formik';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, FormProps, Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import {formatIDString, getFieldError} from 'utils';
import * as yup from 'yup';
import {GET_VERSION_PROFILE_BY_ID_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILE_BY_ID';
import {VersionProfileInput} from '_gqlTypes/globalTypes';
import {IFormError} from '_types/errors';
import LinkedAttributes from './LinkedAttributes';

const FormWrapper = styled(({isNewProfile, ...props}: {isNewProfile: boolean} & FormProps) => <Form {...props} />)`
    && {
        position: unset;
        display: grid;
        grid-template-rows: ${props => (props.isNewProfile ? 'auto 6rem' : 'auto')};
    }
`;

const FormBody = styled.div``;

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

interface IInfoFormProps {
    profile?: GET_VERSION_PROFILE_BY_ID_versionProfiles_list;
    onSubmit?: (profile: VersionProfileInput) => void;
    onCheckIdUniqueness?: (id: string) => Promise<boolean>;
    readonly: boolean;
    loading: boolean;
    errors?: IFormError;
}

function InfoForm({readonly, loading, profile, onSubmit, errors, onCheckIdUniqueness}: IInfoFormProps): JSX.Element {
    const {t} = useTranslation();
    const {availableLangs, defaultLang} = useLang();
    const isReadOnly = readonly || loading;

    const defaultApplicationData: VersionProfileInput = {
        id: '',
        label: availableLangs.reduce((acc, cur) => {
            acc[cur] = '';
            return acc;
        }, {}),
        description: availableLangs.reduce((acc, cur) => {
            acc[cur] = '';
            return acc;
        }, {}),
        trees: []
    };

    const isNewProfile = !profile;
    const initialValues: VersionProfileInput = {
        ...defaultApplicationData,
        ...profile,
        trees: (profile?.trees ?? []).map(tree => tree.id)
    };

    const _handleSubmit = (values: VersionProfileInput) => {
        onSubmit(values);
    };

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (isNewProfile) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdUniqueness);
    }

    const validationSchema = yup.object().shape({
        id: idValidator,
        label: yup.object().shape({
            [defaultLang]: yup.string().required()
        }),
        description: yup
            .object()
            .shape({
                [defaultLang]: yup.string()
            })
            .nullable(),
        trees: yup.array(yup.string())
    });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched,
        submitForm
    }: FormikProps<VersionProfileInput>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (isNewProfile && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = async (e, data) => {
            const isCheckbox = data.type === 'checkbox';
            const value = isCheckbox ? data.checked : data.value;
            const name: string = data.name;

            await setFieldValue(name, value);
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (!isNewProfile) {
                submitForm();
            }
        };

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<VersionProfileInput>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const _handleBlur = (e: React.FocusEvent) => {
            if (isNewProfile) {
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

        const _onSubmit = () => handleSubmit();

        return (
            <FormWrapper onSubmit={_onSubmit} aria-label="infos-form" isNewProfile={isNewProfile}>
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
                            disabled={!isNewProfile || isReadOnly}
                            name="id"
                            aria-label="id"
                            onChange={_handleChange}
                            onBlur={_handleBlur}
                            value={values.id}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('trees')}>
                        <TreesSelector
                            label={t('version_profiles.trees')}
                            placeholder={t('version_profiles.select_trees')}
                            fluid
                            selection
                            multiple
                            width="4"
                            disabled={isReadOnly}
                            name="trees"
                            aria-label="id"
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            value={values.trees}
                        />
                    </FormFieldWrapper>
                    {!isNewProfile && <LinkedAttributes profile={profile} readonly={readonly} />}
                </FormBody>
                {!readonly && isNewProfile && (
                    <FormFooter>
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

export default InfoForm;
