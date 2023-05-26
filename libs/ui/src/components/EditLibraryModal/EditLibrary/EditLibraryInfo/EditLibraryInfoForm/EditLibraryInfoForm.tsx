// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {formatId, idFormatRegex, localizedTranslation} from '@leav/utils';
import {Form, FormInstance, Input, Select} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {
    AttributeType,
    GetLibraryByIdQuery,
    LibraryBehavior,
    LibraryLinkAttributeDetailsFragment
} from '../../../../../_gqlTypes';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import FieldsGroup from '../../../../FieldsGroup';
import {SubmitStateNotifier} from '../../../../SubmitStateNotifier';

const SelectFormItem = styled(Form.Item)`
    .ant-form-item-extra {
        min-height: 0;
    }
`;

interface IEditLibraryInfoFormProps {
    form: FormInstance;
    library: GetLibraryByIdQuery['libraries']['list'][number];
    loading: boolean;
    onSubmitField: (field: string, value: any) => Promise<void>;
    onCheckLibraryUniqueness: (value: string) => Promise<boolean>;
    readOnly?: boolean;
}

function EditLibraryInfoForm({
    form,
    library,
    onSubmitField,
    onCheckLibraryUniqueness,
    loading,
    readOnly
}: IEditLibraryInfoFormProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang, availableLangs, defaultLang} = useLang();
    const isEditing = !!library;

    const [hasIdBeenEdited, setHasIdBeenEdited] = useState(false);
    const [runningFieldsSubmit, setRunningFieldsSubmit] = useState<string[]>([]);
    const [processedFieldsSubmit, setProcessedFieldsSubmit] = useState<string[]>([]);
    const isReadOnly = readOnly || (isEditing && !library?.permissions?.admin_library);

    const _getRequiredMessage = (field: string) =>
        t('errors.field_required', {
            interpolation: {escapeValue: false},
            fieldName: t(`libraries.${field}`)
        });

    const _handleLabelChange = (labelLang: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // If ID hasn't been edited manually, generate it from label
        if (!isEditing && labelLang === defaultLang && !hasIdBeenEdited) {
            form.setFieldsValue({id: formatId(e.target.value)});
        }
    };

    const _handleIdChange = () => {
        setHasIdBeenEdited(true);
    };

    const _handleLibraryUniquenessValidation = async (rule, value) => {
        if (value && (!isEditing || value !== formInitValues.id)) {
            const isLibUnique = await onCheckLibraryUniqueness(value);

            if (!isLibUnique) {
                throw new Error();
            }
        }
    };

    const _handleFieldSubmit = async (field: string, value: any) => {
        if (!form.isFieldTouched(field)) {
            return;
        }

        setRunningFieldsSubmit([...runningFieldsSubmit, field]);

        await onSubmitField(field, value);
        setProcessedFieldsSubmit([...processedFieldsSubmit, field]);

        setRunningFieldsSubmit(runningFieldsSubmit.filter(f => f !== field));
    };

    const _handleSelectChange = (field: string) => (value: string) => {
        _handleFieldSubmit(field, value);
    };

    const _handleBlur = (field: string) => async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (isEditing) {
            _handleFieldSubmit(field, e.target.value);
        }
    };

    const _handleSubmitOnEnter = (field: string) => (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        // If shift is pressed, don't submit
        if (e.shiftKey || !isEditing) {
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            _handleFieldSubmit(field, e.currentTarget.value);
        }
    };

    const {label: libLabel, recordIdentityConf: libRecordIdentityConf, ...librarySettings} = library ?? {};
    const label = libLabel
        ? {
              ...availableLangs.reduce((acc, availableLang) => {
                  acc[`label_${availableLang}`] = library.label[availableLang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const recordIdentityConf = Object.keys(libRecordIdentityConf ?? {})
        .filter(key => key !== '__typename')
        .reduce(
            (acc, confKey) => ({
                ...acc,
                [`recordIdentityConf_${confKey}`]: libRecordIdentityConf[confKey] ?? null
            }),
            {}
        );

    const formInitValues = {
        behavior: LibraryBehavior.standard,
        ...librarySettings,
        ...label,
        ...recordIdentityConf
    };

    const _getFieldState = (field: string) => {
        if (runningFieldsSubmit.find(f => f === field)) {
            return 'processing';
        } else if (processedFieldsSubmit.find(f => f === field)) {
            return 'success';
        } else if (form.getFieldError(field).length) {
            return 'error';
        } else {
            return 'idle';
        }
    };

    const _toAttributeSelectOption = a => ({
        key: a.id,
        value: a.id,
        label: localizedTranslation(a.label, lang) || a.id
    });

    const behaviorOptions = Object.values(LibraryBehavior).map(b => ({
        key: b,
        value: b,
        label: t(`libraries.behavior_${b}`)
    }));

    const attributesOptions = (library?.attributes ?? []).map(_toAttributeSelectOption);

    const filesLinkAttributesOptions = (library?.attributes ?? [])
        .filter(
            a =>
                (a.type === AttributeType.simple_link || a.type === AttributeType.advanced_link) &&
                (a as LibraryLinkAttributeDetailsFragment).linked_library?.behavior === LibraryBehavior.files
        )
        .map(_toAttributeSelectOption);

    const treeAttributesOptions = (library?.attributes ?? [])
        .filter(a => a.type === AttributeType.tree)
        .map(_toAttributeSelectOption);

    const recordIdentityFields = [
        {
            fieldName: 'label',
            options: attributesOptions
        },
        {
            fieldName: 'preview',
            options: filesLinkAttributesOptions
        },
        {
            fieldName: 'color',
            options: attributesOptions
        },
        {
            fieldName: 'treeColorPreview',
            options: treeAttributesOptions
        }
    ];

    return (
        <Form
            aria-label="application_form"
            form={form}
            labelCol={{span: 6}}
            wrapperCol={{span: 24}}
            initialValues={formInitValues}
            labelWrap
            disabled={!isEditing && loading}
        >
            <FieldsGroup label={t('libraries.label')} key="app_label">
                {availableLangs.map(availableLang => (
                    <Form.Item
                        key={`label_${availableLang}`}
                        name={`label_${availableLang}`}
                        label={availableLang.toLowerCase()}
                        labelCol={{span: 2}}
                        wrapperCol={{span: 22}}
                        rules={[
                            {required: availableLang === defaultLang, message: t('errors.default_language_required')}
                        ]}
                        style={{marginBottom: '0.5rem'}}
                    >
                        <Input
                            aria-label={`label_${availableLang}`}
                            onChange={_handleLabelChange(availableLang)}
                            onBlur={_handleBlur(`label_${availableLang}`)}
                            onKeyPress={_handleSubmitOnEnter(`label_${availableLang}`)}
                            disabled={isReadOnly || !!runningFieldsSubmit.find(f => f === `label_${availableLang}`)}
                            suffix={<SubmitStateNotifier state={_getFieldState(`label_${availableLang}`)} />}
                        />
                    </Form.Item>
                ))}
            </FieldsGroup>
            <Form.Item
                name="id"
                key="id"
                label={t('global.id')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[
                    {required: true, message: _getRequiredMessage('id')},
                    {pattern: idFormatRegex, message: t('errors.invalid_id_format')},
                    {
                        validateTrigger: ['onBlur', 'onSubmit'],
                        validator: _handleLibraryUniquenessValidation,
                        message: t('errors.id_already_exists')
                    }
                ]}
                hasFeedback
            >
                <Input disabled={isReadOnly || isEditing} onChange={_handleIdChange} />
            </Form.Item>
            <Form.Item
                name="behavior"
                key="behavior"
                label={t('libraries.behavior')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[{required: true, message: _getRequiredMessage('behavior')}]}
                hasFeedback
            >
                <Select options={behaviorOptions} disabled={isReadOnly || isEditing} />
            </Form.Item>
            {isEditing && (
                <FieldsGroup label={t('libraries.record_identity')} key="recordIdentityConf">
                    {recordIdentityFields.map(({fieldName, options}) => (
                        <SelectFormItem
                            key={fieldName}
                            name={`recordIdentityConf_${fieldName}`}
                            label={t(`libraries.${fieldName}`)}
                            labelCol={{span: 6}}
                            style={{marginBottom: '0.5rem'}}
                            extra={
                                <SubmitStateNotifier
                                    state={_getFieldState(fieldName)}
                                    style={{
                                        position: 'absolute',
                                        right: '35px',
                                        top: '0',
                                        transform: 'translateY(6px)'
                                    }}
                                />
                            }
                        >
                            <Select
                                allowClear
                                autoClearSearchValue
                                showSearch
                                onChange={_handleSelectChange(`recordIdentityConf_${fieldName}`)}
                                options={options}
                                clearIcon={<CloseOutlined />}
                                disabled={isReadOnly || !!runningFieldsSubmit.find(f => f === fieldName)}
                            />
                        </SelectFormItem>
                    ))}
                </FieldsGroup>
            )}
        </Form>
    );
}

export default EditLibraryInfoForm;
