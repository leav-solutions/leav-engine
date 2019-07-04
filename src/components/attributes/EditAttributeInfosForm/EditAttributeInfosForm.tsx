import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form, Icon, Message} from 'semantic-ui-react';
import {formatIDString, getSysTranslationQueryLanguage} from '../../../utils/utils';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType, ValueVersionMode} from '../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../_types//errors';
import LibrariesSelector from '../../libraries/LibrariesSelector';
import FormFieldWrapper from '../../shared/FormFieldWrapper';
import TreesSelector from '../../trees/TreesSelector';

interface IEditAttributeInfosFormProps extends WithNamespaces {
    attribute: GET_ATTRIBUTES_attributes | null;
    onSubmit: (formData: any) => void;
    errors?: IFormError;
    readOnly: boolean;
}

function EditAttributeInfosForm({
    t,
    i18n: i18next,
    errors,
    attribute,
    onSubmit,
    readOnly
}: IEditAttributeInfosFormProps) {
    const defaultAttribute: GET_ATTRIBUTES_attributes = {
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
        permissionsConf: null,
        multipleValues: false,
        versionsConf: {
            versionable: false,
            mode: ValueVersionMode.smart,
            trees: []
        }
    };

    const userLang = getSysTranslationQueryLanguage(i18next);

    const [formValues, setFormValues] = React.useState<GET_ATTRIBUTES_attributes>(
        attribute !== null ? attribute : defaultAttribute
    );

    const existingAttr = attribute !== null;

    const _handleChange = (e, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_ATTRIBUTES_attributes> = {};
        if (name.indexOf('/') !== -1) {
            const [field, subfield] = name.split('/');
            stateUpdate[field] = {...formValues[field]};
            stateUpdate[field][subfield] = value;

            // On new attribute, automatically generate an ID based on label
            if (!existingAttr && field === 'label' && subfield === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        setFormValues({...formValues, ...(stateUpdate as GET_ATTRIBUTES_attributes)});
    };

    const _handleSubmit = e => {
        onSubmit(formValues);
    };

    const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
    const defaultLang = process.env.REACT_APP_DEFAULT_LANG;

    const fieldsErrors = errors && errors.type === ErrorTypes.VALIDATION_ERROR ? errors.fields : {};

    const allowFormat = [AttributeType.advanced, AttributeType.simple].includes(formValues.type);
    const allowMultipleValues = [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree].includes(
        formValues.type
    );
    const allowVersionable = [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree].includes(
        formValues.type
    );
    const isVersionable = !!formValues.versionsConf && formValues.versionsConf.versionable;
    const isLinkAttribute = [AttributeType.advanced_link, AttributeType.simple_link].includes(formValues.type);

    return (
        <React.Fragment>
            {errors && errors.type === ErrorTypes.PERMISSION_ERROR && (
                <Message negative>
                    <Message.Header>
                        <Icon name="ban" /> {errors.message}
                    </Message.Header>
                </Message>
            )}
            <Form onSubmit={_handleSubmit}>
                <Form.Group grouped>
                    <label>{t('attributes.label')}</label>
                    {langs.map(lang => (
                        <FormFieldWrapper
                            key={lang}
                            error={fieldsErrors && fieldsErrors.label ? fieldsErrors.label[lang] : ''}
                        >
                            <Form.Input
                                label={lang}
                                width="4"
                                name={'label/' + lang}
                                disabled={readOnly}
                                required={lang === defaultLang}
                                value={formValues.label && formValues.label[lang] ? formValues.label[lang] : ''}
                                onChange={_handleChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.id : ''}>
                    <Form.Input
                        label={t('attributes.ID')}
                        width="4"
                        disabled={existingAttr || readOnly}
                        name="id"
                        onChange={_handleChange}
                        value={formValues.id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.type : ''}>
                    <Form.Select
                        label={t('attributes.type')}
                        width="4"
                        disabled={existingAttr || formValues.system || readOnly}
                        value={formValues.type}
                        name="type"
                        onChange={_handleChange}
                        options={Object.keys(AttributeType).map(attrType => {
                            return {
                                text: t('attributes.types.' + attrType),
                                value: attrType
                            };
                        })}
                    />
                </FormFieldWrapper>
                {allowFormat && (
                    <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.format : ''}>
                        <Form.Select
                            label={t('attributes.format')}
                            disabled={formValues.system || readOnly}
                            width="4"
                            value={formValues.format || ''}
                            name="format"
                            onChange={_handleChange}
                            options={Object.keys(AttributeFormat).map(f => ({
                                text: t('attributes.formats.' + f),
                                value: f
                            }))}
                        />
                    </FormFieldWrapper>
                )}
                {isLinkAttribute && (
                    <FormFieldWrapper>
                        <LibrariesSelector
                            disabled={formValues.system || readOnly}
                            lang={userLang}
                            fluid
                            selection
                            multiple={false}
                            label={t('attributes.linked_library')}
                            placeholder={t('attributes.linked_library')}
                            width="4"
                            name="linked_library"
                            onChange={_handleChange}
                            value={formValues.linked_library || ''}
                        />
                    </FormFieldWrapper>
                )}
                {formValues.type === AttributeType.tree && (
                    <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.versionsConf : ''}>
                        <TreesSelector
                            fluid
                            selection
                            multiple={false}
                            width="4"
                            disabled={formValues.system || readOnly}
                            label={t('attributes.linked_tree')}
                            placeholder={t('attributes.linked_tree')}
                            value={formValues.linked_tree || ''}
                            name="linked_tree"
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                )}
                {allowMultipleValues && (
                    <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.multipleValues : ''}>
                        <Form.Checkbox
                            label={t('attributes.allow_multiple_values')}
                            disabled={formValues.system || readOnly}
                            width="8"
                            toggle
                            name="multipleValues"
                            onChange={_handleChange}
                            checked={!!formValues.multipleValues}
                        />
                    </FormFieldWrapper>
                )}
                {allowVersionable && (
                    <Form.Group grouped>
                        <label>{t('attributes.values_versions')}</label>
                        <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.versionsConf : ''}>
                            <Form.Checkbox
                                label={t('attributes.versionable')}
                                disabled={formValues.system || readOnly}
                                width="8"
                                toggle
                                name="versionsConf/versionable"
                                onChange={_handleChange}
                                checked={isVersionable}
                            />
                        </FormFieldWrapper>
                        {isVersionable && (
                            <React.Fragment>
                                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.versionsConf : ''}>
                                    <Form.Select
                                        label={t('attributes.versions_mode')}
                                        disabled={formValues.system || readOnly}
                                        width="4"
                                        name="versionsConf/mode"
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
                                            !!formValues.versionsConf && formValues.versionsConf.mode
                                                ? formValues.versionsConf.mode
                                                : ValueVersionMode.smart
                                        }
                                    />
                                </FormFieldWrapper>
                                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.versionsConf : ''}>
                                    <TreesSelector
                                        fluid
                                        selection
                                        width="4"
                                        multiple
                                        disabled={formValues.system || readOnly}
                                        label={t('attributes.versions_trees')}
                                        placeholder={t('attributes.versions_trees')}
                                        value={formValues.versionsConf ? formValues.versionsConf.trees || [] : []}
                                        name="versionsConf/trees"
                                        onChange={_handleChange}
                                        filters={{type: [AttributeType.tree]}}
                                    />
                                </FormFieldWrapper>
                            </React.Fragment>
                        )}
                    </Form.Group>
                )}
                {!readOnly && (
                    <Form.Group inline>
                        <Form.Button>{t('admin.submit')}</Form.Button>
                    </Form.Group>
                )}
            </Form>
        </React.Fragment>
    );
}

export default withNamespaces()(EditAttributeInfosForm);
