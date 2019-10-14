import {Formik, FormikProps} from 'formik';
import React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import useLang from '../../../hooks/useLang';
import {formatIDString, getFieldError} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {ErrorTypes, IFormError} from '../../../_types/errors';
import LibrariesSelector from '../../libraries/LibrariesSelector';
import FormFieldWrapper from '../../shared/FormFieldWrapper';

interface IEditTreeInfosFormProps extends WithNamespaces {
    tree: GET_TREES_trees_list | null;
    onSubmit: (formData: any) => void;
    readOnly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

function EditTreeInfosForm({
    tree,
    onSubmit,
    t,
    readOnly,
    errors,
    onCheckIdExists
}: IEditTreeInfosFormProps): JSX.Element {
    const defaultTree = {
        id: '',
        label: {
            fr: '',
            en: ''
        },
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

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (!existingTree) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdExists);
    }

    const validationSchema: yup.ObjectSchema<Partial<GET_TREES_trees_list>> = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || langs[0]]: yup.string().required()
        }),
        id: idValidator,
        libraries: yup.array(yup.string()).min(1)
    });

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

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<GET_TREES_trees_list>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('trees.label')}</label>
                    {langs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                width="4"
                                name={'label.' + lang}
                                disabled={readOnly}
                                value={label && label[lang] ? label[lang] : ''}
                                onChange={_handleLabelChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('trees.ID')}
                        width="4"
                        disabled={existingTree || readOnly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('libraries')}>
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
                        value={libraries.map(l => l.id)}
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

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={_handleSubmit}
            render={_renderForm}
            validationSchema={validationSchema}
        />
    );
}

export default withNamespaces()(EditTreeInfosForm);
