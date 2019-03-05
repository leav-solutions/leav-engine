import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import {formatIDString, localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';

interface IEditLibraryInfosFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries | null;
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

    const libraryToEdit: GET_LIBRARIES_libraries =
        library === null
            ? {
                  id: '',
                  system: false,
                  label: {
                      fr: '',
                      en: ''
                  },
                  attributes: [],
                  permissionsConf: null,
                  recordIdentityConf: {
                      label: null,
                      color: null,
                      preview: null
                  }
              }
            : library;

    const [libData, setLibData] = useState<GET_LIBRARIES_libraries>(libraryToEdit);
    const {id, label, attributes, recordIdentityConf} = libData;

    const libAttributesOptions = attributes
        ? attributes.map(a => ({
              key: a.id,
              value: a.id,
              text: localizedLabel(a.label, i18n) || a.id
          }))
        : [];
    libAttributesOptions.unshift({key: '', value: '', text: ''});

    const _handleChange = (event, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_LIBRARIES_libraries> = {};

        if (name.indexOf('/') !== -1) {
            const [field, subField] = name.split('/');
            stateUpdate[field] = {...libData[field]};
            stateUpdate[field][subField] = value;

            // On new library, automatically generate an ID based on label
            if (!existingLib && field === 'label' && subField === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        setLibData({...libData, ...stateUpdate});
    };

    const _handleSubmit = e => {
        onSubmit(libData);
    };

    return (
        <Form onSubmit={_handleSubmit}>
            <Form.Group grouped>
                <label>{t('libraries.label')}</label>
                {langs.map(lang => (
                    <Form.Field key={lang}>
                        <label>{lang}</label>
                        <Form.Input
                            name={'label/' + lang}
                            disabled={readonly}
                            value={label ? label[lang] || '' : ''}
                            onChange={_handleChange}
                        />
                    </Form.Field>
                ))}
            </Form.Group>
            <Form.Field>
                <label>{t('libraries.ID')}</label>
                <Form.Input disabled={existingLib || readonly} name="id" onChange={_handleChange} value={id || ''} />
            </Form.Field>
            <Form.Group grouped>
                <label>{t('libraries.record_identity')}</label>
                <Form.Field>
                    <Form.Dropdown
                        search
                        selection
                        options={libAttributesOptions}
                        name="recordIdentityConf/label"
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
                        name="recordIdentityConf/color"
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
                        name="recordIdentityConf/preview"
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
}

export default withNamespaces()(EditLibraryInfosForm);
