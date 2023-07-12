// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import AttributeSelector from 'components/attributes/AttributeSelector';
import VersionProfilesSelector from 'components/versionProfiles/VersionProfilesSelector';
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import {GET_ATTRIBUTES_attributes_list} from '_gqlTypes/GET_ATTRIBUTES';
import {
    GET_ATTRIBUTE_BY_ID_attributes_list,
    GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute,
    GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute,
    GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError} from '../../../../../../utils';
import {AttributeFormat, AttributeType, ValueVersionMode} from '../../../../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import LibrariesSelector from '../../../../../libraries/LibrariesSelector';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';
import TreesSelector from '../../../../../trees/TreesSelector';
import {AttributeInfosFormValues} from '../_types';
import AttributeLibraries from './AttributeLibraries';

interface IInfosFormProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list | null;
    readonly: boolean;
    onSubmitInfos: (dataToSave: AttributeInfosFormValues) => void;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
    forcedType?: AttributeType;
}

const defaultAttributeData: AttributeInfosFormValues = {
    id: '',
    system: false,
    readonly: false,
    label: {
        fr: '',
        en: ''
    },
    description: {
        fr: '',
        en: ''
    },
    type: AttributeType.simple,
    format: AttributeFormat.text,
    linked_tree: null,
    linked_library: null,
    reverse_link: null,
    unique: null,
    permissions_conf: null,
    multiple_values: false,
    metadata_fields: null,
    versions_conf: {
        versionable: false,
        mode: ValueVersionMode.smart,
        profile: null
    },
    libraries: []
};

const FormWrapper = styled(Form)`
    && {
        position: unset;
    }
`;

const FormFooter = styled.div`
    border-top: 1px solid #dddddd;
    padding: 1em;
    text-align: right;
`;

function InfosForm({
    attribute,
    readonly,
    onSubmitInfos,
    errors,
    onCheckIdExists,
    forcedType
}: IInfosFormProps): JSX.Element {
    const {t} = useTranslation();
    const {lang: userLang, availableLangs, defaultLang} = useLang();

    const isNewAttribute = attribute === null;
    const initialValues: AttributeInfosFormValues =
        attribute !== null
            ? {
                  ...attribute,
                  linked_library:
                      (attribute as GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute).linked_library?.id ?? null,
                  reverse_link: (attribute as GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute).reverse_link ?? null,
                  linked_tree: (attribute as GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute).linked_tree?.id ?? null,
                  versions_conf: {
                      ...attribute.versions_conf,
                      profile: attribute.versions_conf?.profile?.id ?? null
                  },
                  unique: (attribute as GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute).unique ?? null
              }
            : defaultAttributeData;

    if (isNewAttribute && forcedType) {
        initialValues.type = forcedType;
    }

    const _handleSubmit = values => {
        onSubmitInfos(values);
    };

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (isNewAttribute) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdExists);
    }

    const validationSchema = yup.object().shape({
        label: yup.object().shape({
            [defaultLang]: yup.string().required()
        }),
        description: yup
            .object()
            .shape({
                [defaultLang]: yup.string()
            })
            .nullable(),
        id: idValidator,
        type: yup.string().required(),
        format: yup.string().nullable(),
        multiple_values: yup.boolean(),
        unique: yup.boolean().nullable(),
        versions_conf: yup
            .object()
            .shape({
                versionable: yup.boolean().nullable(),
                mode: yup
                    .string()
                    .oneOf([...Object.values(ValueVersionMode), null])
                    .nullable(),
                profile: yup.string().nullable()
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
        submitForm
    }: FormikProps<AttributeInfosFormValues>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (isNewAttribute && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleLinkedLibraryChange = (e, data) => {
            _handleChange(e, data);
            setFieldValue('reverse_link', null);
        };

        const _handleChange = async (e, data) => {
            const isCheckbox = data.type === 'checkbox';
            const value = isCheckbox ? data.checked : data.value;
            const name: string = data.name;

            await setFieldValue(name, value);
        };

        const _handleChangeWithSubmit = async (e, data) => {
            await _handleChange(e, data);

            if (!isNewAttribute) {
                submitForm();
            }
        };

        const allowFormat = [AttributeType.advanced, AttributeType.simple].includes(values.type);
        const allowMultipleValues = [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree].includes(
            values.type
        );
        const allowVersionable = [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree].includes(
            values.type
        );
        const isVersionable = !!values.versions_conf && values.versions_conf.versionable;
        const isLinkAttribute = [AttributeType.advanced_link, AttributeType.simple_link].includes(values.type);

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<GET_ATTRIBUTES_attributes_list>(
                fieldName,
                touched,
                serverValidationErrors || {},
                inputErrors
            );

        const _handleBlur = (e: React.FocusEvent) => {
            if (isNewAttribute) {
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

        return (
            <FormWrapper onSubmit={handleSubmit} aria-label="infos-form">
                <Form.Group grouped>
                    <label>{t('attributes.label')}</label>
                    {availableLangs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                width="4"
                                name={`label.${lang}`}
                                aria-label={`label.${lang}`}
                                disabled={readonly}
                                onChange={_handleLabelChange}
                                onBlur={_handleBlur}
                                onKeyPress={_handleKeyPress}
                                value={values.label?.[lang] ?? ''}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <Form.Group grouped>
                    <label>{t('attributes.description')}</label>
                    {availableLangs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`description.${lang}`)}>
                            <Form.Input
                                label={`${lang}`}
                                value={values.description?.[lang] ?? ''}
                                width="4"
                                name={`description.${lang}`}
                                aria-label={`description.${lang}`}
                                disabled={readonly}
                                onChange={_handleChange}
                                onBlur={_handleBlur}
                                onKeyPress={_handleKeyPress}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        width="4"
                        disabled={!isNewAttribute || readonly}
                        name="id"
                        aria-label="id"
                        onChange={_handleChange}
                        onBlur={_handleBlur}
                        value={values.id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('type')}>
                    <Form.Select
                        label={t('attributes.type')}
                        width="4"
                        disabled={!isNewAttribute || values.system || readonly || (isNewAttribute && !!forcedType)}
                        name="type"
                        aria-label="type"
                        onChange={_handleChangeWithSubmit}
                        options={Object.keys(AttributeType).map(attrType => {
                            return {
                                text: t('attributes.types.' + attrType),
                                value: attrType
                            };
                        })}
                        value={values.type}
                    />
                </FormFieldWrapper>
                {allowFormat && (
                    <FormFieldWrapper error={_getErrorByField('format')}>
                        <Form.Select
                            label={t('attributes.format')}
                            disabled={!isNewAttribute || values.system || readonly}
                            width="4"
                            name="format"
                            aria-label="format"
                            onChange={_handleChangeWithSubmit}
                            options={Object.keys(AttributeFormat).map(f => ({
                                text: t('attributes.formats.' + f),
                                value: f
                            }))}
                            value={values.format || ''}
                        />
                    </FormFieldWrapper>
                )}
                {isLinkAttribute && (
                    <FormFieldWrapper error={_getErrorByField('linked_library')}>
                        <LibrariesSelector
                            disabled={values.system || readonly}
                            lang={userLang}
                            fluid
                            selection
                            multiple={false}
                            label={t('attributes.linked_library')}
                            placeholder={t('attributes.linked_library')}
                            width="4"
                            name="linked_library"
                            aria-label="linked_library"
                            onChange={_handleLinkedLibraryChange}
                            value={values.linked_library || ''}
                        />
                    </FormFieldWrapper>
                )}
                <FormFieldWrapper error={_getErrorByField('readonly')}>
                    <Form.Checkbox
                        label={t('attributes.readonly')}
                        width="4"
                        disabled={readonly || values.system}
                        name="readonly"
                        aria-label="readonly"
                        onChange={_handleChangeWithSubmit}
                        onBlur={_handleBlur}
                        checked={values.readonly}
                        toggle
                    />
                </FormFieldWrapper>
                {values.type === AttributeType.simple && (
                    <FormFieldWrapper error={_getErrorByField('unique')}>
                        <Form.Checkbox
                            label={t('attributes.unique')}
                            width="4"
                            disabled={values.system || readonly}
                            name="unique"
                            aria-label="unique"
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            checked={values.unique}
                            toggle
                        />
                    </FormFieldWrapper>
                )}
                {isLinkAttribute && !!values.linked_library && (
                    <FormFieldWrapper error={_getErrorByField('reverse_link')}>
                        <AttributeSelector
                            filters={{
                                libraries: [values.linked_library],
                                type: [AttributeType.advanced_link, AttributeType.simple_link]
                            }}
                            excludeReverseLinks
                            disabled={values.system || readonly}
                            lang={userLang}
                            fluid
                            selection
                            clearable
                            multiple={false}
                            label={t('attributes.reverse_link')}
                            placeholder={t('attributes.linked_attribute')}
                            width="4"
                            name="reverse_link"
                            aria-label="reverse_link"
                            onChange={_handleChangeWithSubmit}
                            value={values.reverse_link || ''}
                        />
                    </FormFieldWrapper>
                )}
                {values.type === AttributeType.tree && (
                    <FormFieldWrapper error={_getErrorByField('versions_conf')}>
                        <TreesSelector
                            fluid
                            selection
                            multiple={false}
                            width="4"
                            disabled={values.system || readonly}
                            label={t('attributes.linked_tree')}
                            placeholder={t('attributes.linked_tree')}
                            name="linked_tree"
                            aria-label="linked_tree"
                            value={values.linked_tree || ''}
                            onChange={_handleChangeWithSubmit}
                        />
                    </FormFieldWrapper>
                )}
                {allowMultipleValues && (
                    <FormFieldWrapper error={_getErrorByField('multiple_values')}>
                        <Form.Checkbox
                            label={t('attributes.allow_multiple_values')}
                            disabled={values.system || readonly}
                            width="8"
                            toggle
                            name="multiple_values"
                            aria-label="multiple_values"
                            onChange={_handleChangeWithSubmit}
                            onBlur={_handleBlur}
                            checked={!!values.multiple_values}
                        />
                    </FormFieldWrapper>
                )}
                {allowVersionable && (
                    <Form.Group grouped>
                        <label>{t('attributes.values_versions')}</label>
                        <FormFieldWrapper error={_getErrorByField('versions_conf.versionable')}>
                            <Form.Checkbox
                                label={t('attributes.versionable')}
                                disabled={values.system || readonly}
                                width="8"
                                toggle
                                name="versions_conf.versionable"
                                aria-label="versions_conf.versionable"
                                onChange={_handleChangeWithSubmit}
                                checked={isVersionable}
                            />
                        </FormFieldWrapper>
                        {isVersionable && (
                            <>
                                <FormFieldWrapper error={_getErrorByField('versions_conf.mode')}>
                                    <Form.Select
                                        label={t('attributes.versions_mode')}
                                        disabled={values.system || readonly}
                                        width="4"
                                        name="versions_conf.mode"
                                        aria-label="versions_conf.mode"
                                        onChange={_handleChangeWithSubmit}
                                        options={[
                                            {
                                                text: t('attributes.versions_mode_simple'),
                                                value: ValueVersionMode.simple
                                            },
                                            {
                                                text: t('attributes.versions_mode_smart'),
                                                value: ValueVersionMode.smart
                                            }
                                        ]}
                                        value={
                                            !!values.versions_conf && values.versions_conf.mode
                                                ? values.versions_conf.mode
                                                : ValueVersionMode.smart
                                        }
                                    />
                                </FormFieldWrapper>
                                <FormFieldWrapper error={_getErrorByField('versions_conf.profile')}>
                                    <VersionProfilesSelector
                                        fluid
                                        selection
                                        width="4"
                                        disabled={values.system || readonly}
                                        label={t('attributes.version_profile')}
                                        placeholder={t('attributes.version_profile')}
                                        value={values?.versions_conf?.profile}
                                        name="versions_conf.profile"
                                        aria-label="versions_conf.profile"
                                        onChange={_handleChangeWithSubmit}
                                        clearable
                                    />
                                </FormFieldWrapper>
                            </>
                        )}
                    </Form.Group>
                )}
                {!isNewAttribute && (
                    <AttributeLibraries
                        attribute={attribute}
                        fluid
                        selection
                        width="10"
                        multiple
                        disabled={values.system || readonly}
                        label={t('attributes.linked_libraries')}
                        placeholder={t('attributes.linked_libraries')}
                        name="libraries"
                        aria-label="linked-libraries"
                    />
                )}
                {!readonly && isNewAttribute && (
                    <FormFooter>
                        <Form.Button
                            type="submit"
                            primary
                            icon
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
            {errors && errors.extensions.code === ErrorTypes.PERMISSION_ERROR && (
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
