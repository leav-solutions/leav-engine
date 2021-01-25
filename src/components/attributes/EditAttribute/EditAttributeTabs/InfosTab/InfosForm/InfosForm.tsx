// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Icon, Message} from 'semantic-ui-react';
import * as yup from 'yup';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError} from '../../../../../../utils';
import {
    GET_ATTRIBUTES_attributes_list,
    GET_ATTRIBUTES_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_attributes_list_TreeAttribute
} from '../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType, ValueVersionMode} from '../../../../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import LibrariesSelector from '../../../../../libraries/LibrariesSelector';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';
import TreesSelector from '../../../../../trees/TreesSelector';

interface IInfosFormProps {
    attribute: GET_ATTRIBUTES_attributes_list | null;
    readonly: boolean;
    onSubmitInfos: (dataToSave: GET_ATTRIBUTES_attributes_list) => void;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
    forcedType?: AttributeType;
}

const defaultAttributeData: GET_ATTRIBUTES_attributes_list = {
    id: '',
    system: false,
    label: {
        fr: '',
        en: ''
    },
    type: AttributeType.simple,
    format: AttributeFormat.text,
    linked_tree: null,
    linked_library: null,
    permissions_conf: null,
    multiple_values: false,
    metadata_fields: null,
    versions_conf: {
        versionable: false,
        mode: ValueVersionMode.smart,
        trees: []
    }
};

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
    const initialValues = attribute !== null ? attribute : defaultAttributeData;

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

    const validationSchema: yup.ObjectSchema<Partial<GET_ATTRIBUTES_attributes_list>> = yup.object().shape({
        label: yup.object().shape({
            fr: yup.string().required()
        }),
        id: idValidator,
        type: yup.string().required(),
        format: yup.string()
    });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<GET_ATTRIBUTES_attributes_list>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (isNewAttribute && field === 'label' && subfield === process.env.REACT_APP_DEFAULT_LANG) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
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

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('attributes.label')}</label>
                    {availableLangs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                width="4"
                                name={`label.${lang}`}
                                disabled={readonly}
                                onChange={_handleLabelChange}
                                onBlur={handleBlur}
                                value={values.label?.[lang] ?? ''}
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
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={values.id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('type')}>
                    <Form.Select
                        label={t('attributes.type')}
                        width="4"
                        disabled={!isNewAttribute || values.system || readonly || (isNewAttribute && !!forcedType)}
                        name="type"
                        onChange={_handleChange}
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
                            disabled={values.system || readonly}
                            width="4"
                            name="format"
                            onChange={_handleChange}
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
                            onChange={_handleChange}
                            value={(values as GET_ATTRIBUTES_attributes_list_LinkAttribute).linked_library?.id || ''}
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
                            value={(values as GET_ATTRIBUTES_attributes_list_TreeAttribute).linked_tree?.id || ''}
                            onChange={_handleChange}
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
                            onChange={_handleChange}
                            checked={!!values.multiple_values}
                        />
                    </FormFieldWrapper>
                )}
                {allowVersionable && (
                    <Form.Group grouped>
                        <label>{t('attributes.values_versions')}</label>
                        <FormFieldWrapper error={_getErrorByField('versions_conf')}>
                            <Form.Checkbox
                                label={t('attributes.versionable')}
                                disabled={values.system || readonly}
                                width="8"
                                toggle
                                name="versions_conf.versionable"
                                onChange={_handleChange}
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
                                        onChange={_handleChange}
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
                                <FormFieldWrapper error={_getErrorByField('versions_conf.trees')}>
                                    <TreesSelector
                                        fluid
                                        selection
                                        width="4"
                                        multiple
                                        disabled={values.system || readonly}
                                        label={t('attributes.versions_trees')}
                                        placeholder={t('attributes.versions_trees')}
                                        value={values.versions_conf ? values.versions_conf.trees || [] : []}
                                        name="versions_conf.trees"
                                        onChange={_handleChange}
                                        filters={{type: [AttributeType.tree]}}
                                    />
                                </FormFieldWrapper>
                            </>
                        )}
                    </Form.Group>
                )}
                {!readonly && (
                    <Form.Group inline>
                        <Form.Button type="submit" data-test-id="attribute-infos-submit-btn">
                            {t('admin.submit')}
                        </Form.Button>
                    </Form.Group>
                )}
            </Form>
        );
    };

    return (
        <>
            {errors && errors.extensions.code === ErrorTypes.PERMISSION_ERROR && (
                <Message negative>
                    <Message.Header>
                        <Icon name="ban" /> {errors.message}
                    </Message.Header>
                </Message>
            )}
            <Formik
                initialValues={initialValues}
                onSubmit={_handleSubmit}
                render={_renderForm}
                validateOnChange
                validationSchema={validationSchema}
            />
        </>
    );
}

export default InfosForm;
