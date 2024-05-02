// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {idFormatRegex, Override, slugifyString} from '@leav/utils';
import {Form, FormInstance, Input, InputNumber, Select, Switch} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {
    AttributeDetailsFragment,
    AttributeDetailsLinkAttributeFragment,
    AttributeDetailsStandardAttributeFragment,
    AttributeDetailsTreeAttributeFragment,
    AttributeFormat,
    AttributeType,
    ValueVersionMode
} from '../../../../../_gqlTypes';
import FieldsGroup from '../../../../FieldsGroup';
import {SubmitStateNotifier} from '../../../../SubmitStateNotifier';
import {LinkedLibraryForm} from './LinkedLibraryForm';
import {LinkedTreeForm} from './LinkedTreeForm';
import {ValuesVersionsForm} from './ValuesVersionsForm';

const SwitchFormItem = styled(Form.Item)`
    .ant-form-item-extra {
        min-height: 0;
        position: absolute;
        left: 50px;
        top: 50%;
        transform: translateY(-50%);
    }
`;

const SwitchWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const DescriptionFormItem = styled(Form.Item)`
    position: relative;
    .ant-form-item-extra {
        min-height: 0;
    }
`;

type FormValues = Partial<
    Override<
        AttributeDetailsLinkAttributeFragment &
            AttributeDetailsStandardAttributeFragment &
            AttributeDetailsTreeAttributeFragment,
        {versions_conf: Override<AttributeDetailsFragment['versions_conf'], {profile: string}>}
    >
>;

interface IEditAttributeInfoFormProps {
    form: FormInstance;
    attribute: AttributeDetailsFragment;
    loading: boolean;
    onSubmitField: (field: string, value: any) => Promise<void>;
    onCheckAttributeUniqueness: (value: string) => Promise<boolean>;
    readOnly?: boolean;
}

function EditAttributeInfoForm({
    form,
    attribute,
    onSubmitField,
    onCheckAttributeUniqueness,
    loading,
    readOnly: isReadOnly
}: IEditAttributeInfoFormProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {availableLangs, defaultLang} = useLang();
    const currentType = Form.useWatch('type', form);
    const [hasIdBeenEdited, setHasIdBeenEdited] = useState(false);
    const [runningFieldsSubmit, setRunningFieldsSubmit] = useState<string[]>([]);
    const [processedFieldsSubmit, setProcessedFieldsSubmit] = useState<string[]>([]);

    const isEditing = !!attribute;
    const isTypeStandard = currentType === AttributeType.simple || currentType === AttributeType.advanced;
    const isTypeLink = currentType === AttributeType.simple_link || currentType === AttributeType.advanced_link;
    const isTypeTree = currentType === AttributeType.tree;
    const isTypeNotSimple = currentType !== AttributeType.simple && currentType !== AttributeType.simple_link;

    const _getRequiredMessage = (field: string) =>
        t('errors.field_required', {
            interpolation: {escapeValue: false},
            fieldName: t(`attributes.${field}`)
        });

    const _handleLabelChange = (labelLang: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // If ID hasn't been edited manually, generate it from label
        if (!isEditing && labelLang === defaultLang && !hasIdBeenEdited) {
            form.setFieldsValue({id: slugifyString(e.target.value)});
        }
    };

    const _handleNumberChange = (field: string) => (value: number) => {
        form.setFieldsValue({[field]: value});
    };

    const _handleIdChange = () => {
        setHasIdBeenEdited(true);
    };

    const _handleAttributeUniquenessValidation = async (rule, value) => {
        if (value && (!isEditing || value !== formInitValues.id)) {
            const isAttributeUnique = await onCheckAttributeUniqueness(value);

            if (!isAttributeUnique) {
                throw new Error();
            }
        }
    };

    const _handleFieldSubmit = async (field: string, value: any) => {
        if (!isEditing) {
            return;
        }

        // Consider boolean fields as always touched
        if (!form.isFieldTouched(field) && typeof value !== 'boolean') {
            return;
        }

        setRunningFieldsSubmit([...runningFieldsSubmit, field]);

        await onSubmitField(field, value);
        setProcessedFieldsSubmit([...processedFieldsSubmit, field]);

        setRunningFieldsSubmit(runningFieldsSubmit.filter(f => f !== field));
    };

    const _handleSelectChange = (field: string) => (value: string) => _handleFieldSubmit(field, value);

    const _handleCheckboxChange = (field: string) => (value: boolean) => {
        _handleFieldSubmit(field, value);
    };

    const _handleVersionsConfChange = (field: string | string[], value: string | boolean) => {
        _handleFieldSubmit('versions_conf', value);
    };

    const _handleBlur = (field: string) => async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        _handleFieldSubmit(field, e.target.value);
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

    const {label: attributeLabel, description: attributeDescription, ...attributeSettings} = attribute ?? {};
    const label = attributeLabel
        ? {
              ...availableLangs.reduce((acc, availableLang) => {
                  acc[`label_${availableLang}`] = attribute.label[availableLang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const description = attributeDescription
        ? {
              ...availableLangs.reduce((acc, availableLang) => {
                  acc[`description_${availableLang}`] = attribute.description[availableLang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const formInitValues: FormValues = {
        type: AttributeType.simple,
        format: AttributeFormat.text,
        readonly: false,
        maxLength: null,
        unique: false,
        ...attributeSettings,
        ...label,
        ...description,
        versions_conf: {
            versionable: attribute?.versions_conf?.versionable ?? false,
            mode: attribute?.versions_conf?.mode ?? ValueVersionMode.smart,
            profile: attribute?.versions_conf?.profile?.id ?? null
        }
    };

    const typeSelectOptions = Object.values(AttributeType).map(b => ({
        key: b,
        value: b,
        label: t(`attributes.type_${b}`)
    }));

    const formatSelectOptions = Object.values(AttributeFormat).map(b => ({
        key: b,
        value: b,
        label: t(`attributes.format_${b}`)
    }));

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
            <FieldsGroup label={t('attributes.label')} key="attribute_label">
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
            <FieldsGroup label={t('attributes.description')} key="attribute_description">
                {availableLangs.map(availableLang => (
                    <DescriptionFormItem
                        key={`description_${availableLang}`}
                        name={`description_${availableLang}`}
                        label={availableLang.toLowerCase()}
                        labelCol={{span: 2}}
                        wrapperCol={{span: 22}}
                        style={{marginBottom: '0.5rem'}}
                        extra={
                            <SubmitStateNotifier
                                style={{position: 'absolute', top: '0.5rem', right: '0.5rem'}}
                                state={_getFieldState(`description_${availableLang}`)}
                            />
                        }
                    >
                        <Input.TextArea
                            aria-label={`description_${availableLang}`}
                            onBlur={_handleBlur(`description_${availableLang}`)}
                            onKeyDown={_handleSubmitOnEnter(`description_${availableLang}`)}
                            disabled={isReadOnly}
                        />
                    </DescriptionFormItem>
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
                        validator: _handleAttributeUniquenessValidation,
                        message: t('errors.id_already_exists')
                    }
                ]}
                hasFeedback
            >
                <Input disabled={isReadOnly || isEditing} onChange={_handleIdChange} />
            </Form.Item>
            <Form.Item
                name="type"
                key="type"
                label={t('attributes.type')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[{required: true, message: _getRequiredMessage('type')}]}
                hasFeedback
            >
                <Select options={typeSelectOptions} disabled={isReadOnly || isEditing} aria-label="" />
            </Form.Item>
            {isTypeStandard && (
                <Form.Item
                    name="format"
                    key="format"
                    label={t('attributes.format')}
                    validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                    rules={[{required: true, message: _getRequiredMessage('format')}]}
                    hasFeedback
                >
                    <Select options={formatSelectOptions} disabled={isReadOnly || isEditing} aria-label="" />
                </Form.Item>
            )}
            {isTypeLink && (
                <LinkedLibraryForm
                    isReadOnly={isReadOnly}
                    onChange={_handleSelectChange('linked_library')}
                    extra={<SubmitStateNotifier state={_getFieldState('linked_library')} />}
                    selected={form.getFieldValue('linked_library')?.id}
                />
            )}
            {isTypeTree && (
                <LinkedTreeForm
                    isReadOnly={isReadOnly}
                    onChange={_handleSelectChange('linked_tree')}
                    extra={<SubmitStateNotifier state={_getFieldState('linked_tree')} />}
                    selected={form.getFieldValue('linked_tree')?.id}
                />
            )}
            <SwitchFormItem
                name="readonly"
                key="readonly"
                label={t('attributes.readonly')}
                validateTrigger={['onChange', 'onSubmit']}
                valuePropName="checked"
                extra={<SubmitStateNotifier state={_getFieldState('readonly')} />}
            >
                <Switch disabled={isReadOnly} onChange={_handleCheckboxChange('readonly')} />
            </SwitchFormItem>
            {form.getFieldValue('type') === AttributeType.simple && (
                <SwitchFormItem
                    name="unique"
                    key="unique"
                    label={t('attributes.unique')}
                    validateTrigger={['onChange', 'onSubmit']}
                    valuePropName="checked"
                    extra={<SubmitStateNotifier state={_getFieldState('unique')} />}
                >
                    <Switch disabled={isReadOnly} onChange={_handleCheckboxChange('unique')} />
                </SwitchFormItem>
            )}
            {[AttributeType.simple, AttributeType.advanced].includes(form.getFieldValue('type')) && (
                <Form.Item
                    name="maxLength"
                    label={t('global.max_length')}
                    validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                >
                    <InputNumber
                        min={1}
                        disabled={isReadOnly}
                        onChange={_handleNumberChange('maxLength')}
                        onBlur={() => {
                            _handleFieldSubmit('maxLength', form.getFieldValue('maxLength'));
                        }}
                    />
                </Form.Item>
            )}
            {isTypeNotSimple && (
                <SwitchFormItem
                    name="multiple_values"
                    key="multiple_values"
                    label={t('attributes.multiple_values')}
                    validateTrigger={['onChange', 'onSubmit']}
                    valuePropName="checked"
                    extra={<SubmitStateNotifier state={_getFieldState('multiple_values')} />}
                >
                    <Switch disabled={isReadOnly} onChange={_handleCheckboxChange('multiple_values')} />
                </SwitchFormItem>
            )}
            {isTypeNotSimple && (
                <ValuesVersionsForm
                    isReadOnly={isReadOnly}
                    isEditing={isEditing}
                    onChange={_handleVersionsConfChange}
                    extra={<SubmitStateNotifier state={_getFieldState('versions_conf')} />}
                />
            )}
        </Form>
    );
}

export default EditAttributeInfoForm;
