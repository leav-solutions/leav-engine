// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form} from 'antd';
import {useEffect} from 'react';
import {useLang} from '../../../../hooks';
import {
    TreeDetailsFragment,
    TreeInput,
    useCheckTreeExistenceLazyQuery,
    useSaveTreeMutation
} from '../../../../_gqlTypes';
import {EditTreeInfoForm} from './EditTreeInfoForm';

interface IEditTreeInfoProps {
    tree?: TreeDetailsFragment;
    onSetSubmitFunction?: (submitFunction: () => Promise<TreeDetailsFragment>) => void;
    readOnly?: boolean;
}

function EditTreeInfo({tree, onSetSubmitFunction, readOnly}: IEditTreeInfoProps): JSX.Element {
    const {availableLangs} = useLang();
    const [form] = Form.useForm();
    const isEditing = !!tree;

    const [saveTree, {loading}] = useSaveTreeMutation();

    const [checkTreeExistence] = useCheckTreeExistenceLazyQuery({
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        partialRefetch: false
    });

    useEffect(() => {
        if (onSetSubmitFunction) {
            onSetSubmitFunction(_submitForm);
        }
    }, []);

    const _submitForm = async () => {
        await form.validateFields();
        const values = form.getFieldsValue();

        const label = Object.keys(values)
            .filter(key => key.startsWith('label_'))
            .reduce((acc, key) => {
                acc[key.replace('label_', '')] = values[key] ?? '';
                return acc;
            }, {});

        const libraries: TreeInput['libraries'] = (form.getFieldValue('libraries') ?? []).map(library => {
            const {__typename, ...settingsToSave} = library.settings;
            return {
                library: library.library.id,
                settings: settingsToSave
            };
        });

        try {
            const res = await saveTree({
                variables: {
                    tree: {
                        id: values.id,
                        label,
                        behavior: values.behavior,
                        libraries
                    }
                }
            });

            return res.data.saveTree;
        } catch (e) {
            // Display errors in form
            form.setFields(
                Object.keys(e.graphQLErrors?.[0]?.extensions?.fields ?? {}).map(fieldName => {
                    return {
                        name: fieldName,
                        errors: [e.graphQLErrors[0].extensions.fields[fieldName]]
                    };
                })
            );

            throw e;
        }
    };

    const _submitField = async (field: string, value: any) => {
        // Consider boolean fields as always touched
        if (!isEditing || (!form.isFieldTouched(field) && typeof value !== 'boolean')) {
            return;
        }

        await form.validateFields([field]);

        let dataToSave;
        if (field.startsWith('label_')) {
            const modifiedLang = field.replace('label_', '');
            dataToSave = {
                label: availableLangs.reduce((acc, lang) => {
                    acc[lang] = lang === modifiedLang ? value : form.getFieldValue(`label_${lang}`);
                    return acc;
                }, {})
            };
        } else if (field === 'libraries') {
            const librariesToSave: TreeInput['libraries'] = value.map(library => {
                const {__typename, ...settingsToSave} = library.settings;
                return {
                    library: library.library.id,
                    settings: settingsToSave
                };
            });

            dataToSave = {
                libraries: librariesToSave
            };
        } else {
            dataToSave = {
                [field]: value
            };
        }

        try {
            await saveTree({
                variables: {
                    tree: {
                        id: tree.id,
                        ...dataToSave
                    }
                }
            });

            form.setFields([
                {
                    name: field,
                    touched: false
                }
            ]);
        } catch (err) {
            // Display errors in form
            form.setFields([
                {
                    name: field,
                    errors: [err.graphQLErrors?.[0]?.extensions?.fields?.[field] ?? err.message]
                }
            ]);
        }
    };

    const _isTreeUnique = async (value: any) => {
        const {data: treeExistenceData} = await checkTreeExistence({
            variables: {
                id: value
            }
        });

        return !treeExistenceData?.trees?.totalCount;
    };

    return (
        <EditTreeInfoForm
            form={form}
            onCheckTreeUniqueness={_isTreeUnique}
            onSubmitField={_submitField}
            tree={tree}
            loading={loading}
            readOnly={readOnly}
        />
    );
}

export default EditTreeInfo;
