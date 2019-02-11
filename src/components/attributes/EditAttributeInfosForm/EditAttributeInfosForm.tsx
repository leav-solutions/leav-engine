import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form, Icon, Message} from 'semantic-ui-react';
import FormFieldWrapper from 'src/components/shared/FormFieldWrapper';
import {formatIDString} from 'src/utils/utils';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from 'src/_types/errors';

interface IEditAttributeInfosFormProps extends WithNamespaces {
    attribute: GET_ATTRIBUTES_attributes | null;
    onSubmit: (formData: any) => void;
    errors?: IFormError;
}

function EditAttributeInfosForm({t, i18n: i18next, errors, attribute, onSubmit}: IEditAttributeInfosFormProps) {
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
        permissionsConf: null
    };

    const [formValues, setFormValues] = React.useState<GET_ATTRIBUTES_attributes>(
        attribute !== null ? attribute : defaultAttribute
    );

    const existingAttr = attribute !== null;

    const _handleChange = (e, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_ATTRIBUTES_attributes> = {};
        if (name.indexOf('/') !== -1) {
            const [field, lang] = name.split('/');
            stateUpdate[field] = {...formValues[field]};
            stateUpdate[field][lang] = value;

            // On new attribute, automatically generate an ID based on label
            if (!existingAttr && field === 'label' && lang === process.env.REACT_APP_DEFAULT_LANG) {
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
                        disabled={existingAttr}
                        name="id"
                        onChange={_handleChange}
                        value={formValues.id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.type : ''}>
                    <Form.Select
                        label={t('attributes.type')}
                        width="4"
                        disabled={formValues.system}
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
                <FormFieldWrapper error={!!fieldsErrors ? fieldsErrors.format : ''}>
                    <Form.Select
                        label={t('attributes.format')}
                        disabled={formValues.system}
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
                <Form.Group inline>
                    <Form.Button>{t('admin.submit')}</Form.Button>
                </Form.Group>
            </Form>
        </React.Fragment>
    );
}

export default withNamespaces()(EditAttributeInfosForm);
