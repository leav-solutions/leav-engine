import {Formik, FormikProps} from 'formik';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import {formatIDString, localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';

interface IEditLibraryInfosFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries_list | null;
    onSubmit: (formData: any) => void;
    readonly: boolean;
}

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function EditLibraryInfosForm({library, onSubmit, readonly, t, i18n}: IEditLibraryInfosFormProps) {
    const existingLib = library !== null;
    const langs = ['fr', 'en'];

    const defaultLibrary: GET_LIBRARIES_libraries_list = {
        id: '',
        system: false,
        label: {
            fr: '',
            en: ''
        },
        attributes: [],
        permissions_conf: null,
        recordIdentityConf: {
            label: null,
            color: null,
            preview: null
        }
    };

    const initialValues: GET_LIBRARIES_libraries_list = library === null ? defaultLibrary : library;

    const libAttributesOptions = initialValues.attributes
        ? initialValues.attributes.map(a => ({
              key: a.id,
              value: a.id,
              text: localizedLabel(a.label, i18n) || a.id
          }))
        : [];
    libAttributesOptions.unshift({key: '', value: '', text: ''});

    const _handleSubmit = values => {
        onSubmit(values);
    };

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<GET_LIBRARIES_libraries_list>) => {
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

        const {id, label, recordIdentityConf} = values;

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {langs.map(lang => (
                        <Form.Field key={lang}>
                            <label>{lang}</label>
                            <Form.Input
                                name={'label.' + lang}
                                disabled={readonly}
                                value={label[lang]}
                                onChange={_handleLabelChange}
                            />
                        </Form.Field>
                    ))}
                </Form.Group>
                <Form.Field>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={existingLib || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </Form.Field>
                <Form.Group grouped>
                    <label>{t('libraries.record_identity')}</label>
                    <Form.Field>
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
                    </Form.Field>
                    <Form.Field>
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
                    </Form.Field>
                    <Form.Field>
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
                    </Form.Field>
                </Form.Group>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button>{t('admin.submit')}</Form.Button>
                    </FormGroupWithMargin>
                )}
            </Form>
        );
    };
    return <Formik initialValues={initialValues} onSubmit={_handleSubmit} render={_renderForm} />;
}

export default withNamespaces()(EditLibraryInfosForm);
