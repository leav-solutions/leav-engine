// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {endpointFormatRegex, getFlagByLang, idFormatRegex, slugifyString} from '@leav/utils';
import {ColorPicker, Form, FormInstance} from 'antd';
import {Color} from 'antd/es/color-picker';
import {KitInput, KitSelect} from 'aristid-ds';
import React, {useState} from 'react';
import styled from 'styled-components';
import {useLang} from '../../../../hooks';
import {useSharedTranslation} from '../../../../hooks/useSharedTranslation';
import {ApplicationType, GetApplicationByIdQuery} from '../../../../_gqlTypes';
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
    const [hasEndpointBeenEdited, setHasEndpointBeenEdited] = useState(false);
    const [runningFieldsSubmit, setRunningFieldsSubmit] = useState<string[]>([]);
    const [processedFieldsSubmit, setProcessedFieldsSubmit] = useState<string[]>([]);
    const isReadOnly = isEditing && !application?.permissions?.admin_application;

    const _getRequiredMessage = (field: string) =>
        t('errors.field_required', {
            interpolation: {escapeValue: false},
            fieldName: t(`applications.${field}`)
        });

    const _handleLabelChange = (lang: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditing || lang !== defaultLang) {
            return;
        }

        // If ID or endpoint hasn't been edited manually, generate it from label
        if (!hasIdBeenEdited) {
            form.setFieldsValue({id: slugifyString(e.target.value)});
        }

        if (!hasEndpointBeenEdited) {
            form.setFieldsValue({endpoint: slugifyString(e.target.value, '-')});
        }
    };

    const _handleIdChange = () => {
        setHasIdBeenEdited(true);
    };

    const _handleEndpointChange = () => {
        setHasEndpointBeenEdited(true);
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

    const _handleSubmitOnEnter =
        (field: string) => (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            {availableLangs.map((lang, index) => (
                <Form.Item
                    key={`label_${lang}`}
                    name={`label_${lang}`}
                    rules={[{required: lang === defaultLang, message: t('errors.default_language_required')}]}
                    style={{marginBottom: '0.5rem'}}
                >
                    <KitInput
                        label={!index ? t('applications.label') : null}
                        placeholder={t(`lang.${lang.toLowerCase()}`)}
                        title={t(`lang.${lang.toLowerCase()}`)}
                        aria-label={`label_${lang}`}
                        onChange={_handleLabelChange(lang)}
                        onBlur={_handleBlur(`label_${lang}`)}
                        onKeyPress={_handleSubmitOnEnter(`label_${lang}`)}
                        disabled={isReadOnly || !!runningFieldsSubmit.find(f => f === `label_${lang}`)}
                        suffix={<SubmitStateNotifier state={_getFieldState(`label_${lang}`)} />}
                        prefix={getFlagByLang(lang)}
                    />
                </Form.Item>
            ))}
            {availableLangs.map((lang, index) => (
                <DescriptionFormItem
                    key={`description_${lang}`}
                    name={`description_${lang}`}
                    style={{marginBottom: '0.5rem'}}
                    extra={
                        <SubmitStateNotifier
                            style={{position: 'absolute', top: '0.5rem', right: '0.5rem'}}
                            state={_getFieldState(`description_${lang}`)}
                        />
                    }
                >
                    <KitInput.TextArea
                        label={!index ? t('applications.description') : null}
                        placeholder={t(`lang.${lang.toLowerCase()}`)}
                        title={t(`lang.${lang.toLowerCase()}`)}
                        aria-label={`description_${lang}`}
                        onBlur={_handleBlur(`description_${lang}`)}
                        onKeyDown={_handleSubmitOnEnter(`description_${lang}`)}
                        disabled={isReadOnly}
                        prefix="🇫🇷"
                    />
                </DescriptionFormItem>
            ))}
            <Form.Item
                name="id"
                key="id"
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
                <KitInput
                    label={t('applications.id')}
                    disabled={isReadOnly || isEditing}
                    onChange={_handleIdChange}
                    aria-label="id"
                />
            </Form.Item>
            <Form.Item name="type" key="type" rules={[{required: true, message: _getRequiredMessage('type')}]}>
                <KitSelect
                    label={t('applications.type')}
                    onChange={_handleTypeChange}
                    disabled={isReadOnly || isEditing}
                    aria-label={t('applications.type')}
                    options={typeSelectOptions}
                />
            </Form.Item>
            {isInternalApp && (
                <ModuleSelector
                    name="module"
                    disabled={isReadOnly || isEditing}
                    rules={[{required: true, message: _getRequiredMessage('module')}]}
                />
            )}
            <Form.Item
                name="endpoint"
                key="endpoint"
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
                    label={t(isInternalApp ? 'applications.endpoint' : 'applications.url')}
                    prefix={isInternalApp ? appsBaseUrl : null}
                    onBlur={_handleBlur('endpoint')}
                    onKeyDown={_handleSubmitOnEnter('endpoint')}
                    onChange={_handleEndpointChange}
                    suffix={<SubmitStateNotifier state={_getFieldState('endpoint')} />}
                    disabled={isReadOnly}
                    aria-label="endpoint"
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
