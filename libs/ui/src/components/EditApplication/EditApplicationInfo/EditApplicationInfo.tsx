// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form} from 'antd';
import {useEffect} from 'react';
import {useLang} from '../../../hooks';
import {
    GetApplicationByIdQuery,
    useCheckApplicationExistenceLazyQuery,
    useSaveApplicationMutation
} from '../../../_gqlTypes';
import EditApplicationInfoForm from './EditApplicationInfoForm';

interface IEditApplicationInfoProps {
    application: GetApplicationByIdQuery['applications']['list'][number];
    onSetSubmitFunction?: (submitFunction: () => Promise<void>) => void;
}

function EditApplicationInfo({application, onSetSubmitFunction}: IEditApplicationInfoProps): JSX.Element {
    const {availableLangs} = useLang();
    const [form] = Form.useForm();
    const isEditing = !!application;

    const [saveApplication, {loading}] = useSaveApplicationMutation();

    const [checkApplicationExistence] = useCheckApplicationExistenceLazyQuery({
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        variables: {},
        partialRefetch: false
    });

    const _submitForm = async () => {
        await form.validateFields();
        const values = form.getFieldsValue();

        const label = Object.keys(values)
            .filter(key => key.startsWith('label_'))
            .reduce((acc, key) => {
                acc[key.replace('label_', '')] = values[key];
                return acc;
            }, {});

        const description = Object.keys(values)
            .filter(key => key.startsWith('description_'))
            .reduce((acc, key) => {
                acc[key.replace('description_', '')] = values[key];
                return acc;
            }, {});

        try {
            await saveApplication({
                variables: {
                    application: {
                        id: values.id,
                        label,
                        description,
                        module: values.module,
                        type: values.type,
                        endpoint: values.endpoint
                    }
                }
            });
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
        if (!form.isFieldTouched(field) || !isEditing) {
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
        } else {
            dataToSave = {
                [field]: value
            };
        }

        try {
            await saveApplication({
                variables: {
                    application: {
                        id: application.id,
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

    const _isApplicationUnique = async (fieldToCheck: 'id' | 'endpoint', value: any) => {
        const {data: applicationExistenceData} = await checkApplicationExistence({
            variables: {
                // Force undefined values to fix a weird bug where both values are sent to the server even if only one is passed
                id: undefined,
                endpoint: undefined,
                [fieldToCheck]: value
            }
        });

        return !applicationExistenceData?.applications?.totalCount;
    };

    useEffect(() => {
        if (onSetSubmitFunction) {
            onSetSubmitFunction(_submitForm);
        }
    }, []);

    return (
        <EditApplicationInfoForm
            form={form}
            onSubmitField={_submitField}
            onCheckApplicationUniqueness={_isApplicationUnique}
            application={application}
            loading={loading}
        />
    );
}

export default EditApplicationInfo;
