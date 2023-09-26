// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {endpointFormatRegex, formatId, idFormatRegex} from '@leav/utils';
import {ColorPicker, Form, FormInstance} from 'antd';
import {Color} from 'antd/lib/color-picker';
import {KitInput, KitSelect} from 'aristid-ds';
import React, {useState} from 'react';
import styled from 'styled-components';
import {useLang} from '../../../../hooks';
import {useSharedTranslation} from '../../../../hooks/useSharedTranslation';
import {ApplicationType, GetApplicationByIdQuery} from '../../../../_gqlTypes';
import FieldsGroup from '../../../FieldsGroup';
import {SubmitStateNotifier} from '../../../SubmitStateNotifier';
import ModuleSelector from './ModuleSelector';

const DescriptionFormItem = styled(Form.Item)`
    .ant-form-item-extra {
        min-height: 0;
    }
`;

interface IEditApplicationInfoFormProps {
    form: FormInstance;
    application: GetApplicationByIdQuery['applications']['list'][number];
    loading: boolean;
    onSubmitField: (field: string, value: any) => Promise<void>;
    onCheckApplicationUniqueness: (fieldToCheck: 'id' | 'endpoint', value: any) => Promise<boolean>;
}

function EditApplicationInfoForm({
    form,
    application,
    onSubmitField,
    onCheckApplicationUniqueness,
    loading
}: IEditApplicationInfoFormProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {availableLangs, defaultLang} = useLang();
    const isEditing = !!application;

    const [isInternalApp, setIsInternalApp] = useState(true);
    const [hasIdBeenEdited, setHasIdBeenEdited] = useState(false);
    const [runningFieldsSubmit, setRunningFieldsSubmit] = useState<string[]>([]);
    const [processedFieldsSubmit, setProcessedFieldsSubmit] = useState<string[]>([]);
    const isReadOnly = isEditing && !application?.permissions?.admin_application;

    const _getRequiredMessage = (field: string) =>
        t('errors.field_required', {
            interpolation: {escapeValue: false},
            fieldName: t(`applications.${field}`)
        });

    const _handleLabelChange = (lang: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // If ID hasn't been edited manually, generate it from label
        if (!isEditing && lang === defaultLang && !hasIdBeenEdited) {
            form.setFieldsValue({id: formatId(e.target.value)});
        }
    };

    const _handleIdChange = () => {
        setHasIdBeenEdited(true);
    };

    const _handleTypeChange = (value: ApplicationType) => {
        setIsInternalApp(value === ApplicationType.internal);
    };

    const _handleAppUniquenessValidation = (fieldToCheck: 'id' | 'endpoint') => async (rule, value) => {
        if (value && (!isEditing || value !== formInitValues[fieldToCheck])) {
            const isAppUnique = await onCheckApplicationUniqueness(fieldToCheck, value);

            if (!isAppUnique) {
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

    const _handleColorChange = (value: Color) => {
        if (isEditing) {
            _handleFieldSubmit('color', value.toHexString());
        }
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

    const label = application?.label
        ? {
              ...availableLangs.reduce((acc, lang) => {
                  acc[`label_${lang}`] = application.label[lang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const description = application?.description
        ? {
              ...availableLangs.reduce((acc, lang) => {
                  acc[`description_${lang}`] = application.description[lang] ?? '';
                  return acc;
              }, {})
          }
        : {};

    const formInitValues = {
        type: ApplicationType.internal,
        ...application,
        ...label,
        ...description
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

    const appsBaseUrl = window.location.origin + '/app/';

    const typeSelectOptions = Object.values(ApplicationType).map(type => ({
        label: t(`applications.type_${type}`),
        value: type
    }));

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
            <FieldsGroup label={t('applications.label')} key="app_label">
                {availableLangs.map(lang => (
                    <Form.Item
                        key={`label_${lang}`}
                        name={`label_${lang}`}
                        label={lang.toLowerCase()}
                        labelCol={{span: 2}}
                        wrapperCol={{span: 22}}
                        rules={[{required: lang === defaultLang, message: t('errors.default_language_required')}]}
                        style={{marginBottom: '0.5rem'}}
                    >
                        <KitInput
                            aria-label={`label_${lang}`}
                            onChange={_handleLabelChange(lang)}
                            onBlur={_handleBlur(`label_${lang}`)}
                            onKeyPress={_handleSubmitOnEnter(`label_${lang}`)}
                            disabled={isReadOnly || !!runningFieldsSubmit.find(f => f === `label_${lang}`)}
                            suffix={<SubmitStateNotifier state={_getFieldState(`label_${lang}`)} />}
                        />
                    </Form.Item>
                ))}
            </FieldsGroup>
            <FieldsGroup label={t('applications.description')} key="description">
                {availableLangs.map(lang => (
                    <DescriptionFormItem
                        key={`description_${lang}`}
                        name={`description_${lang}`}
                        label={lang.toLowerCase()}
                        labelCol={{span: 2}}
                        wrapperCol={{span: 22}}
                        style={{marginBottom: '0.5rem'}}
                        extra={
                            <SubmitStateNotifier
                                style={{position: 'absolute', top: '0.5rem', right: '0.5rem'}}
                                state={_getFieldState(`description_${lang}`)}
                            />
                        }
                    >
                        <KitInput.TextArea
                            aria-label={`description_${lang}`}
                            onBlur={_handleBlur(`description_${lang}`)}
                            onKeyDown={_handleSubmitOnEnter(`description_${lang}`)}
                            disabled={isReadOnly}
                        />
                    </DescriptionFormItem>
                ))}
            </FieldsGroup>
            <Form.Item
                name="id"
                key="id"
                label={t('applications.id')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[
                    {required: true, message: _getRequiredMessage('id')},
                    {pattern: idFormatRegex, message: t('errors.invalid_id_format')},
                    {
                        validateTrigger: ['onBlur', 'onSubmit'],
                        validator: _handleAppUniquenessValidation('id'),
                        message: t('errors.id_already_exists')
                    }
                ]}
                hasFeedback
            >
                <KitInput disabled={isReadOnly || isEditing} onChange={_handleIdChange} aria-label="id" />
            </Form.Item>
            <Form.Item
                name="type"
                key="type"
                label={t('applications.type')}
                rules={[{required: true, message: _getRequiredMessage('type')}]}
            >
                <KitSelect
                    onChange={_handleTypeChange}
                    disabled={isReadOnly || isEditing}
                    aria-label=""
                    options={typeSelectOptions}
                />
            </Form.Item>
            {isInternalApp && (
                <ModuleSelector
                    name="module"
                    label={t('applications.module')}
                    disabled={isReadOnly || isEditing}
                    rules={[{required: true, message: _getRequiredMessage('module')}]}
                />
            )}
            <Form.Item
                name="endpoint"
                key="endpoint"
                label={t(isInternalApp ? 'applications.endpoint' : 'applications.url')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                rules={[
                    {
                        required: true,
                        message: _getRequiredMessage(isInternalApp ? 'endpoint' : 'url')
                    },
                    {
                        pattern: isInternalApp ? endpointFormatRegex : null,
                        message: t('errors.invalid_endpoint_format')
                    },
                    {
                        validateTrigger: ['onBlur', 'onSubmit'],
                        validator: isInternalApp ? _handleAppUniquenessValidation('endpoint') : null,
                        message: t('errors.endpoint_already_used')
                    },
                    {
                        type: isInternalApp ? 'string' : 'url',
                        message: t('errors.invalid_url_format')
                    }
                ]}
                hasFeedback
            >
                <KitInput
                    prefix={isInternalApp ? appsBaseUrl : null}
                    onBlur={_handleBlur('endpoint')}
                    onKeyDown={_handleSubmitOnEnter('endpoint')}
                    suffix={<SubmitStateNotifier state={_getFieldState('endpoint')} />}
                    disabled={isReadOnly}
                />
            </Form.Item>
            <Form.Item
                name="color"
                label={t('applications.color')}
                validateTrigger={['onBlur', 'onChange', 'onSubmit']}
                hasFeedback
            >
                <ColorPicker format="hex" onChangeComplete={_handleColorChange} disabled={isReadOnly} />
            </Form.Item>
        </Form>
    );
}

export default EditApplicationInfoForm;
