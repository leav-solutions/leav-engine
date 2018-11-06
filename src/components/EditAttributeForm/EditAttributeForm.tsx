import {i18n, TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Form, Header} from 'semantic-ui-react';
import {formatIDString, localizedLabel} from 'src/utils/utils';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';

interface IEditAttributeFormProps {
    attribute: GET_ATTRIBUTES_attributes | null;
    onSubmit: (formData: any) => void;
    t: TranslationFunction;
    i18n: i18n;
}

interface IEditAttributeFormState extends GET_ATTRIBUTES_attributes {
    existingAttr?: boolean;
}

class EditAttributeForm extends React.Component<IEditAttributeFormProps, IEditAttributeFormState> {
    public submitBtn: React.RefObject<any>;

    constructor(props: IEditAttributeFormProps) {
        super(props);

        const defaultAttribute: GET_ATTRIBUTES_attributes = {
            id: '',
            system: false,
            label: {
                fr: '',
                en: ''
            },
            type: AttributeType.simple,
            format: AttributeFormat.text
        };

        const editedAttr = !!props.attribute ? {...props.attribute} : {...defaultAttribute};

        this.state = {
            ...editedAttr,
            existingAttr: this.props.attribute !== null
        };

        this.submitBtn = React.createRef();
    }

    public render() {
        const {t, i18n: i18next} = this.props;
        const attribute = this.state;

        const label =
            attribute.existingAttr && !!attribute.label
                ? localizedLabel(attribute.label, i18next)
                : t('attributes.new');
        const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
        const defaultLang = process.env.REACT_APP_DEFAULT_LANG;

        return (
            <div>
                <Header>{label}</Header>
                <Form onSubmit={this._handleSubmit}>
                    <Form.Group grouped>
                        <label>{t('attributes.label')}</label>
                        {langs.map(lang => (
                            <Form.Field key={lang}>
                                <Form.Input
                                    label={lang}
                                    width="4"
                                    name={'label/' + lang}
                                    required={lang === defaultLang}
                                    value={attribute.label && attribute.label[lang] ? attribute.label[lang] : ''}
                                    onChange={this._handleChange}
                                />
                            </Form.Field>
                        ))}
                    </Form.Group>
                    <Form.Field>
                        <label>{t('attributes.ID')}</label>
                        <Form.Input
                            width="4"
                            disabled={attribute.existingAttr}
                            name="id"
                            onChange={this._handleChange}
                            value={attribute.id}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Select
                            label={t('attributes.type')}
                            width="4"
                            disabled={attribute.system}
                            value={attribute.type}
                            name="type"
                            onChange={this._handleChange}
                            options={Object.keys(AttributeType).map(type => {
                                return {
                                    text: t('attributes.types.' + type),
                                    value: type
                                };
                            })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Select
                            label={t('attributes.format')}
                            disabled={attribute.system}
                            width="4"
                            value={attribute.format || ''}
                            name="format"
                            onChange={this._handleChange}
                            options={Object.keys(AttributeFormat).map(f => ({
                                text: t('attributes.formats.' + f),
                                value: f
                            }))}
                        />
                    </Form.Field>
                    <Form.Group inline>
                        <Form.Button>{t('admin.submit')}</Form.Button>
                    </Form.Group>
                </Form>
            </div>
        );
    }

    private _handleChange = (event, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<IEditAttributeFormState> = {};

        if (name.indexOf('/') !== -1) {
            const [field, lang] = name.split('/');
            stateUpdate[field] = {...this.state[field]};
            stateUpdate[field][lang] = value;

            // On new attribute, automatically generate an ID based on label
            if (!this.state.existingAttr && field === 'label' && lang === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        this.setState(stateUpdate as IEditAttributeFormState);
    }

    private _handleSubmit = e => {
        this.props.onSubmit(this.state);
    }
}

export default translate()(EditAttributeForm);
