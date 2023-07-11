import {ColorPicker, Form, Input, InputNumber, Modal, Radio, Space} from 'antd';
import {ComponentProps, useState} from 'react';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {LibraryPreviewsSettingsFragment} from '../../../../../_gqlTypes';
import FieldsGroup from '../../../../FieldsGroup';
import {SizesEditor} from './SizesEditor';

enum BackgroundMode {
    transparent = 'transparent',
    color = 'color'
}

interface IEditPreviewsSettingsModalProps {
    previewsSetting?: LibraryPreviewsSettingsFragment;
    open: boolean;
    onClose: () => void;
    onSubmit: (previewsSetting: LibraryPreviewsSettingsFragment) => Promise<void>;
    readOnly?: boolean;
}

function EditPreviewsSettingsModal({
    previewsSetting,
    readOnly,
    open,
    onClose,
    onSubmit
}: IEditPreviewsSettingsModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {availableLangs, defaultLang} = useLang();
    const isReadOnly = readOnly || previewsSetting?.system;
    const hasBackground = previewsSetting?.versions?.background !== 'false';
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);

    const formInitValues: LibraryPreviewsSettingsFragment = previewsSetting
        ? {
              ...previewsSetting,
              versions: {
                  ...previewsSetting.versions,
                  background:
                      !previewsSetting.versions.background || previewsSetting.versions.background === 'false'
                          ? '#00000000'
                          : previewsSetting.versions.background
              }
          }
        : {
              label: null,
              description: null,
              system: false,
              versions: {
                  background: '#ffffff',
                  density: 300,
                  sizes: []
              }
          };

    const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(
        hasBackground ? BackgroundMode.color : BackgroundMode.transparent
    );

    const [form] = Form.useForm<LibraryPreviewsSettingsFragment>();

    const _handleSizesChange = (sizes: LibraryPreviewsSettingsFragment['versions']['sizes']) => {
        form.setFieldValue(['versions', 'sizes'], sizes);
    };

    const _handleBackgroundChange: ComponentProps<typeof ColorPicker>['onChange'] = color => {
        const hexColor = color.toHexString();
        form.setFieldValue(['versions', 'background'], hexColor);
    };

    const _handleSubmit = async () => {
        setIsSubmitLoading(true);
        await form.validateFields();
        const values = form.getFieldsValue();
        await onSubmit(values);
        setIsSubmitLoading(false);
    };

    const _handleBackgroundModeChange: ComponentProps<typeof Radio.Group>['onChange'] = e => {
        setBackgroundMode(e.target.value);
        const newFieldValue = e.target.value === BackgroundMode.transparent ? 'false' : '#ffffff';
        form.setFieldValue(['versions', 'background'], newFieldValue);
    };

    return (
        <Modal
            width={800}
            onCancel={onClose}
            open={open}
            centered
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            onOk={_handleSubmit}
            bodyStyle={{height: 'calc(95vh - 15rem)', overflow: 'auto'}}
            title={t('libraries.previews_settings.title')}
            confirmLoading={isSubmitLoading}
        >
            <Form form={form} labelCol={{span: 6}} wrapperCol={{span: 24}} initialValues={formInitValues}>
                <FieldsGroup label={t('libraries.previews_settings.label')}>
                    {availableLangs.map(availableLang => (
                        <Form.Item
                            key={`label_${availableLang}`}
                            name={['label', availableLang]}
                            label={availableLang.toLowerCase()}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                            rules={[
                                {
                                    required: availableLang === defaultLang,
                                    message: t('errors.default_language_required')
                                }
                            ]}
                            style={{marginBottom: '0.5rem'}}
                        >
                            <Input aria-label={`label_${availableLang}`} disabled={isReadOnly} />
                        </Form.Item>
                    ))}
                </FieldsGroup>
                <FieldsGroup label={t('libraries.previews_settings.description')}>
                    {availableLangs.map(availableLang => (
                        <Form.Item
                            key={`description_${availableLang}`}
                            name={['description', availableLang]}
                            label={availableLang.toLowerCase()}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                            style={{marginBottom: '0.5rem'}}
                        >
                            <Input.TextArea
                                aria-label={`description_${availableLang}`}
                                disabled={isReadOnly}
                                rows={1}
                            />
                        </Form.Item>
                    ))}
                </FieldsGroup>
                <Form.Item
                    key="density"
                    name={['versions', 'density']}
                    label={t('libraries.previews_settings.density')}
                >
                    <InputNumber aria-label="density" disabled={isReadOnly} addonAfter="dpi" />
                </Form.Item>
                <Form.Item label={t('libraries.previews_settings.background')}>
                    <Space>
                        <Radio.Group onChange={_handleBackgroundModeChange} value={backgroundMode} buttonStyle="solid">
                            <Radio.Button value={BackgroundMode.transparent}>
                                {t('libraries.previews_settings.transparent')}
                            </Radio.Button>
                            <Radio.Button value={BackgroundMode.color}>
                                {t('libraries.previews_settings.color')}
                            </Radio.Button>
                        </Radio.Group>
                        <Form.Item key="background" name={['versions', 'background']} style={{margin: 0}}>
                            <ColorPicker
                                style={backgroundMode !== BackgroundMode.color ? {display: 'none'} : null}
                                allowClear
                                disabled={isReadOnly}
                                onChange={_handleBackgroundChange}
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>
                <Form.Item key="sizes" name={['versions', 'sizes']} label={t('libraries.previews_settings.sizes')}>
                    <SizesEditor
                        sizes={previewsSetting?.versions?.sizes ?? []}
                        readOnly={isReadOnly}
                        onChange={_handleSizesChange}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditPreviewsSettingsModal;
