import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';

interface IEditLibraryInfosFormProps {
    library: GET_LIBRARIES_libraries | null;
    onLibUpdate?: (lib: GET_LIBRARIES_libraries) => void;
    t: TranslationFunction;
    onSubmit: (formData: any) => void;
}

class EditLibraryInfosForm extends React.Component<IEditLibraryInfosFormProps, any> {
    constructor(props: IEditLibraryInfosFormProps) {
        super(props);

        this.state = {
            ...this.props.library
        };
    }

    public render() {
        const {library, t} = this.props;

        const libraryToEdit: GET_LIBRARIES_libraries =
            library === null
                ? {
                      id: '',
                      system: false,
                      label: {
                          fr: '',
                          en: ''
                      },
                      attributes: []
                  }
                : library;

        const existingLib = !!libraryToEdit.id;
        const langs = ['fr', 'en'];

        return (
            <Form onSubmit={this._handleSubmit}>
                <Form.Field>
                    <label>{t('libraries.ID')}</label>
                    <Form.Input
                        disabled={existingLib}
                        name="id"
                        onChange={this._handleChange}
                        value={this.state.id || ''}
                    />
                </Form.Field>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {langs.map(lang => (
                        <Form.Field key={lang}>
                            <label>{lang}</label>
                            <Form.Input
                                name={'label/' + lang}
                                value={this.state.label ? this.state.label[lang] || '' : ''}
                                onChange={this._handleChange}
                            />
                        </Form.Field>
                    ))}
                </Form.Group>
                <Form.Group style={{marginTop: 10}}>
                    <Form.Button>{t('admin.submit')}</Form.Button>
                </Form.Group>
            </Form>
        );
    }

    private _handleChange = event => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name: string = target.name;
        const stateUpdate = {};

        if (name.indexOf('/') !== -1) {
            const [field, lang] = name.split('/');
            stateUpdate[field] = {...this.state[field]};
            stateUpdate[field][lang] = value;
        } else {
            stateUpdate[name] = value;
        }

        this.setState(stateUpdate);
    }

    private _handleSubmit = e => {
        this.props.onSubmit(this.state);
    }
}

export default translate()(EditLibraryInfosForm);
