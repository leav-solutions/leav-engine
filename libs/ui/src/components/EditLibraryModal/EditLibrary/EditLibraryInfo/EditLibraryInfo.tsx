// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {Form} from 'antd';
import {useEffect} from 'react';
import {
    GetLibraryByIdQuery,
    SaveLibraryMutation,
    useCheckLibraryExistenceLazyQuery,
    useSaveLibraryMutation
} from '../../../../_gqlTypes';
import {useLang} from '../../../../hooks';
import {EditLibraryInfoForm} from './EditLibraryInfoForm';

interface IEditApplicationInfoProps {
    library?: GetLibraryByIdQuery['libraries']['list'][number];
    onSetSubmitFunction?: (submitFunction: () => Promise<SaveLibraryMutation['saveLibrary']>) => void;
    readOnly?: boolean;
}

function EditApplicationInfo({library, onSetSubmitFunction, readOnly}: IEditApplicationInfoProps): JSX.Element {
    const {availableLangs} = useLang();
    const [form] = Form.useForm();
    const isEditing = !!library;

    const [saveLibrary, {loading}] = useSaveLibraryMutation();

    const [checkLibraryExistence] = useCheckLibraryExistenceLazyQuery({
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
                acc[key.replace('label_', '')] = values[key];
                return acc;
            }, {});

        try {
            const res = await saveLibrary({
                variables: {
                    library: {
                        id: values.id,
                        label,
                        behavior: values.behavior
                    }
                }
            });

            return res.data.saveLibrary;
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
        } else if (field.startsWith('recordIdentityConf')) {
            const {__typename, ...existingConf} = (library.recordIdentityConf as WithTypename<typeof library>) || {};

            dataToSave = {
                recordIdentityConf: {
                    ...existingConf,
                    [field.replace('recordIdentityConf_', '')]: value ?? null
                }
            };
        } else {
            dataToSave = {
                [field]: value
            };
        }

        try {
            await saveLibrary({
                variables: {
                    library: {
                        id: library.id,
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

    const _isLibraryUnique = async (value: any) => {
        const {data: libraryExistenceData} = await checkLibraryExistence({
            variables: {
                id: value
            }
        });

        return !libraryExistenceData?.libraries?.totalCount;
    };

    useEffect(() => {
        if (onSetSubmitFunction) {
            onSetSubmitFunction(_submitForm);
        }
    }, []);

    return (
        <EditLibraryInfoForm
            form={form}
            onCheckLibraryUniqueness={_isLibraryUnique}
            onSubmitField={_submitField}
            library={library}
            loading={loading}
            readOnly={readOnly}
        />
    );
}

export default EditApplicationInfo;
