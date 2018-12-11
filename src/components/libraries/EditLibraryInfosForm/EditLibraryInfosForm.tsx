import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import {formatIDString, localizedLabel} from 'src/utils/utils';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';

interface IEditLibraryInfosFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries | null;
    onLibUpdate?: (lib: GET_LIBRARIES_libraries) => void;
    onSubmit: (formData: any) => void;
}

class EditLibraryInfosForm extends React.Component<IEditLibraryInfosFormProps, any> {
    constructor(props: IEditLibraryInfosFormProps) {
        super(props);

        const libraryToEdit: GET_LIBRARIES_libraries =
            props.library === null
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
                : props.library;

        this.state = {
            ...libraryToEdit
        };
    }

    public render() {
        const {t, i18n} = this.props;
        const {id, label, attributes, recordIdentityConf} = this.state;

        const existingLib = this.props.library !== null;
        const langs = ['fr', 'en'];
        const libAttributesOptions = attributes
            ? attributes.map(a => ({
                  key: a.id,
                  value: a.id,
                  text: localizedLabel(a.label, i18n) || a.id
              }))
            : [];
        libAttributesOptions.unshift({key: '', value: '', text: ''});

        return (
            <Form onSubmit={this._handleSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {langs.map(lang => (
                        <Form.Field key={lang}>
                            <label>{lang}</label>
                            <Form.Input
                                name={'label/' + lang}
                                value={label ? label[lang] || '' : ''}
                                onChange={this._handleChange}
                            />
                        </Form.Field>
                    ))}
                </Form.Group>
                <Form.Field>
                    <label>{t('libraries.ID')}</label>
                    <Form.Input disabled={existingLib} name="id" onChange={this._handleChange} value={id || ''} />
                </Form.Field>
                <Form.Group grouped>
                    <label>{t('libraries.record_identity')}</label>
                    <Form.Field>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf/label"
                            label={t('libraries.record_identity_label')}
                            value={recordIdentityConf && recordIdentityConf.label ? recordIdentityConf.label : ''}
                            onChange={this._handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf/color"
                            label={t('libraries.record_identity_color')}
                            value={recordIdentityConf && recordIdentityConf.color ? recordIdentityConf.color : ''}
                            onChange={this._handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf/preview"
                            label={t('libraries.record_identity_preview')}
                            value={recordIdentityConf && recordIdentityConf.preview ? recordIdentityConf.preview : ''}
                            onChange={this._handleChange}
                        />
                    </Form.Field>
                </Form.Group>
                <Form.Group style={{marginTop: 10}}>
                    <Form.Button>{t('admin.submit')}</Form.Button>
                </Form.Group>
            </Form>
        );
    }

    private _handleChange = (event, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_LIBRARIES_libraries> = {};

        if (name.indexOf('/') !== -1) {
            const [field, subField] = name.split('/');
            stateUpdate[field] = {...this.state[field]};
            stateUpdate[field][subField] = value;

            // On new library, automatically generate an ID based on label
            if (!this.state.existingAttr && field === 'label' && subField === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        this.setState(stateUpdate);
    }

    private _handleSubmit = e => {
        this.props.onSubmit(this.state);
    }
}

export default withNamespaces()(EditLibraryInfosForm);
