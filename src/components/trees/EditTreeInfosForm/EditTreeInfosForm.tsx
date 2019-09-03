import {Formik, FormikProps} from 'formik';
import React from 'react';
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

    const initialValues: GET_TREES_trees_list = tree === null ? defaultTree : tree;

    const existingTree = tree !== null;

    const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
    const defaultLang = process.env.REACT_APP_DEFAULT_LANG;
    const {lang: userLang} = useLang();

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
    }: FormikProps<GET_TREES_trees_list>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (!existingTree && field === 'label' && subfield === process.env.REACT_APP_DEFAULT_LANG) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const {id, label, libraries, system} = values;

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('trees.label')}</label>
                    {langs.map(lang => (
                        <FormFieldWrapper key={lang}>
                            <Form.Input
                                label={lang}
                                width="4"
                                name={'label.' + lang}
                                disabled={readOnly}
                                required={lang === defaultLang}
                                value={label && label[lang] ? label[lang] : ''}
                                onChange={_handleLabelChange}
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
    };

    return <Formik initialValues={initialValues} onSubmit={_handleSubmit} render={_renderForm} />;
}

export default withNamespaces()(EditTreeInfosForm);
