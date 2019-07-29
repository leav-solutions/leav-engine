import React, {useState} from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../hooks/useLang';
import {formatIDString} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import LibrariesSelector from '../../libraries/LibrariesSelector';
import FormFieldWrapper from '../../shared/FormFieldWrapper';

interface IEditTreeInfosFormProps extends WithNamespaces {
    tree: GET_TREES_trees_list | null;
    onSubmit: (formData: any) => void;
    readOnly: boolean;
}

interface IEditTreeInfosFormState extends GET_TREES_trees_list {
    existingTree: boolean;
}

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function EditTreeInfosForm({tree, onSubmit, t, readOnly}: IEditTreeInfosFormProps): JSX.Element {
    const defaultTree = {
        id: '',
        label: null,
        system: false,
        libraries: []
    };

    const [formValues, setFormValues] = useState<IEditTreeInfosFormState>({
        ...(tree !== null ? tree : defaultTree),
        existingTree: !!tree && !!tree.id
    });

    const {id, label, libraries, existingTree, system} = formValues;

    const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
    const defaultLang = process.env.REACT_APP_DEFAULT_LANG;
    const {lang: userLang} = useLang();

    const _handleChange = (event, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_TREES_trees_list> = {};

        if (name.indexOf('/') !== -1) {
            const [field, lang] = name.split('/');
            stateUpdate[field] = {...formValues[field]};
            stateUpdate[field][lang] = value;

            // On new library, automatically generate an ID based on label
            if (!formValues.existingTree && field === 'label' && lang === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        setFormValues({...formValues, ...(stateUpdate as IEditTreeInfosFormState)});
    };

    const _handleSubmit = e => {
        onSubmit(formValues);
    };

    return (
        <Form onSubmit={_handleSubmit}>
            <Form.Group grouped>
                <label>{t('trees.label')}</label>
                {langs.map(lang => (
                    <FormFieldWrapper key={lang}>
                        <Form.Input
                            label={lang}
                            width="4"
                            name={'label/' + lang}
                            disabled={readOnly}
                            required={lang === defaultLang}
                            value={label && label[lang] ? label[lang] : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                ))}
            </Form.Group>
            <FormFieldWrapper>
                <Form.Input
                    label={t('trees.ID')}
                    width="4"
                    disabled={existingTree || readOnly}
                    name="id"
                    onChange={_handleChange}
                    value={id}
                />
            </FormFieldWrapper>
            <FormFieldWrapper>
                <LibrariesSelector
                    disabled={system || readOnly}
                    lang={userLang}
                    fluid
                    selection
                    multiple
                    label={t('trees.libraries')}
                    placeholder={t('trees.libraries')}
                    width="4"
                    name="libraries"
                    onChange={_handleChange}
                    value={libraries}
                />
            </FormFieldWrapper>
            {!readOnly && (
                <FormGroupWithMargin>
                    <Form.Button>{t('admin.submit')}</Form.Button>
                </FormGroupWithMargin>
            )}
        </Form>
    );
}

export default withNamespaces()(EditTreeInfosForm);
