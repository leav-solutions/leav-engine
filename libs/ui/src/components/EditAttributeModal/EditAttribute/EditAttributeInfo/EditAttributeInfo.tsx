// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form} from 'antd';
import {useEffect} from 'react';
import {
    AttributeDetailsFragment,
    AttributeType,
    useCheckAttributeExistenceLazyQuery,
    useSaveAttributeMutation
} from '../../../../_gqlTypes';
import {useLang} from '../../../../hooks';
import {EditAttributeInfoForm} from './EditAttributeInfoForm';

interface IEditAttributeInfoProps {
    attribute?: AttributeDetailsFragment;
    onSetSubmitFunction?: (submitFunction: () => Promise<AttributeDetailsFragment>) => void;
    readOnly?: boolean;
}

function EditAttributeInfo({attribute, onSetSubmitFunction, readOnly}: IEditAttributeInfoProps): JSX.Element {
    const {availableLangs} = useLang();
    const [form] = Form.useForm();
    const isEditing = !!attribute;

    const [saveAttribute, {loading}] = useSaveAttributeMutation();

    const [checkAttributeExistence] = useCheckAttributeExistenceLazyQuery({
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        partialRefetch: false
    });

    const _submitForm = async () => {
        await form.validateFields();
        const values = form.getFieldsValue();

        const label = Object.keys(values)
            .filter(key => key.startsWith('label_'))
            .reduce((acc, key) => {
                acc[key.replace('label_', '')] = values[key] ?? '';
                return acc;
            }, {});

        const description = Object.keys(values)
            .filter(key => key.startsWith('description_'))
            .reduce((acc, key) => {
                acc[key.replace('description_', '')] = values[key] ?? '';
                return acc;
            }, {});

        const isStandardType = values.type === AttributeType.simple || values.type === AttributeType.advanced;
        const isLinkType = values.type === AttributeType.simple_link || values.type === AttributeType.advanced_link;
        const isTreeType = values.type === AttributeType.tree;
        const isTypeNotSimple = values.type !== AttributeType.simple && values.type !== AttributeType.simple_link;

        try {
            const res = await saveAttribute({
                variables: {
                    attribute: {
                        id: values.id,
                        label,
                        description,
                        type: values.type,
                        format: isStandardType ? values.format : null,
                        readonly: values.readonly,
                        unique: values.type === AttributeType.simple ? values.unique : false,
                        maxLength: values.maxLength ?? null,
                        multiple_values: isTypeNotSimple ? values.multiple_values : false,
                        versions_conf: isTypeNotSimple
                            ? {
                                  versionable: values?.versions_conf?.versionable ?? false,
                                  mode: values?.versions_conf?.mode ?? null,
                                  profile: values?.versions_conf?.profile ?? null
                              }
                            : null,
                        linked_library: isLinkType ? values.linked_library.id : null,
                        linked_tree: isTreeType ? values.linked_tree.id : null
                    }
                }
            });

            return res.data.saveAttribute;
        } catch (e) {
            // Display errors in form
            form.setFields(
                Object.keys(e.graphQLErrors?.[0]?.extensions?.fields ?? {}).map(fieldName => ({
                        name: fieldName,
                        errors: [e.graphQLErrors[0].extensions.fields[fieldName]]
                    }))
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
        } else if (field.startsWith('description_')) {
            const modifiedLang = field.replace('description_', '');
            dataToSave = {
                description: availableLangs.reduce((acc, lang) => {
                    acc[lang] = lang === modifiedLang ? value : form.getFieldValue(`description_${lang}`);
                    return acc;
                }, {})
            };
        } else if (field.startsWith('versions_conf')) {
            dataToSave = {
                versions_conf: form.getFieldValue('versions_conf')
            };
        } else {
            dataToSave = {
                [field]: value
            };
        }

        try {
            await saveAttribute({
                variables: {
                    attribute: {
                        id: attribute.id,
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

    const _isAttributeUnique = async (value: any) => {
        const {data: attributeExistenceData} = await checkAttributeExistence({
            variables: {
                id: value
            }
        });

        return !attributeExistenceData?.attributes?.totalCount;
    };

    useEffect(() => {
        if (onSetSubmitFunction) {
            onSetSubmitFunction(_submitForm);
        }
    }, []);

    return (
        <EditAttributeInfoForm
            form={form}
            onCheckAttributeUniqueness={_isAttributeUnique}
            onSubmitField={_submitField}
            attribute={attribute}
            loading={loading}
            readOnly={readOnly}
        />
    );
}

export default EditAttributeInfo;
