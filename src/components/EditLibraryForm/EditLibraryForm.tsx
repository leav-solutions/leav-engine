import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Form, Header} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';

interface IEditLibraryFormProps {
    library: GET_LIBRARIES_libraries | null;
    onSubmit: (formData: any) => void;
    t: TranslationFunction;
}

class EditLibraryForm extends React.Component<IEditLibraryFormProps, any> {
    constructor(props: IEditLibraryFormProps) {
        super(props);

        this.state = {
            ...this.props.library
        };
    }

    public render() {
        let {library} = this.props;
        const {t} = this.props;

        const newLib = library === null;

        if (library === null) {
            library = {
                id: '',
                system: false,
                label: {
                    fr: '',
                    en: ''
                },
                attributes: []
            };
        }

        const existingLib = !!library.id;
        const label = newLib
            ? t('libraries.new')
            : library.label !== null
                ? library.label.fr || library.label.en || library.id
                : library.id;
        const langs = ['fr', 'en'];

        return (
            <div>
                <Header>{label}</Header>
                <Form onSubmit={this._handleSubmit}>
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
                    <Form.Field>
                        <label>{t('libraries.ID')}</label>
                        <Form.Input
                            disabled={existingLib}
                            name="id"
                            onChange={this._handleChange}
                            value={this.state.id || ''}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Checkbox
                            label={t('libraries.isSystem')}
                            disabled
                            checked={!!library.system}
                            name="system"
                        />
                    </Form.Field>
                    <Form.Group inline>
                        <Form.Button>{t('admin.submit')}</Form.Button>
                    </Form.Group>
                </Form>
            </div>
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

export default translate()(EditLibraryForm);
