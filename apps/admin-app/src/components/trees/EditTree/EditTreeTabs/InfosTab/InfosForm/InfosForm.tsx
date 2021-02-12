// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik, FormikProps} from 'formik';
import omit from 'lodash/omit';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import useLang from '../../../../../../hooks/useLang';
import {formatIDString, getFieldError} from '../../../../../../utils';
import {
    GET_TREE_BY_ID_trees_list,
    GET_TREE_BY_ID_trees_list_libraries_settings
} from '../../../../../../_gqlTypes/GET_TREE_BY_ID';
import {TreeBehavior, TreeInput, TreeLibraryInput} from '../../../../../../_gqlTypes/globalTypes';
import {ErrorTypes, IFormError} from '../../../../../../_types/errors';
import {Override} from '../../../../../../_types/Override';
import FormFieldWrapper from '../../../../../shared/FormFieldWrapper';
import TreeLibraries from './TreeLibraries';

interface ITreeInfosFormProps {
    tree: GET_TREE_BY_ID_trees_list | null;
    onSubmit: (formData: TreeInput) => void;
    readonly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

type TreeInfos = Override<
    GET_TREE_BY_ID_trees_list,
    {
        libraries: TreeLibraryInput[];
    }
>;

const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

const TreeInfosForm = ({tree, onSubmit, readonly, errors, onCheckIdExists}: ITreeInfosFormProps): JSX.Element => {
    const {t} = useTranslation();
    const defaultTree = {
        id: '',
        label: {
            fr: '',
            en: ''
        },
        behavior: TreeBehavior.standard,
        system: false,
        permissions_conf: null,
        libraries: []
    };

    const initialValues: TreeInfos =
        tree === null
            ? defaultTree
            : {
                  ...tree,
                  libraries: tree.libraries.map(treeLib => ({
                      library: treeLib.library.id,
                      settings: omit(treeLib.settings, ['__typename']) as GET_TREE_BY_ID_trees_list_libraries_settings
                  }))
              };

    const existingTree = tree !== null;

    const {lang: userLang, defaultLang, availableLangs} = useLang();

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

    const validationSchema: yup.ObjectSchema<Partial<TreeInfos>> = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || availableLangs[0]]: yup.string().required()
        }),
        id: idValidator,
        libraries: yup.array(
            yup.object().shape({
                library: yup.string(),
                settings: yup.object()
            })
        )
    });

    const behaviorOptions = Object.values(TreeBehavior).map(b => ({
        key: b,
        value: b,
        text: t(`trees.behavior_${b}`)
    }));

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<TreeInfos>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (!existingTree && field === 'label' && subfield === defaultLang) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const {id, label, libraries, system, behavior} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<TreeInfos>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        const _handleLibrariesChange = (librariesSettings: TreeLibraryInput[]) => {
            setFieldValue('libraries', librariesSettings);
        };

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('trees.label')}</label>
                    {availableLangs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                width="4"
                                name={'label.' + lang}
                                disabled={readonly}
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
                        disabled={existingTree || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('behavior')}>
                    <Form.Select
                        label={t('trees.behavior')}
                        disabled
                        name="behavior"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={behavior}
                        options={behaviorOptions}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper error={_getErrorByField('libraries')}>
                    <TreeLibraries
                        libraries={libraries}
                        onChange={_handleLibrariesChange}
                        readonly={system || readonly}
                    />
                </FormFieldWrapper>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button type="submit">{t('admin.submit')}</Form.Button>
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
};

export default TreeInfosForm;
