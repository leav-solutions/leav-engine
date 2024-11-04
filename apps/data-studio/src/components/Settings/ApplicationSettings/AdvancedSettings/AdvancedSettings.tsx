// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SubmitStateNotifier, SubmitStateNotifierStates, useSaveApplicationMutation} from '@leav/ui';
import {Form, Space, Switch} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

function AdvancedSettings(): JSX.Element {
    const [form] = Form.useForm();
    const {t} = useTranslation();
    const {currentApp} = useApplicationContext();
    const [submitState, setSubmitState] = useState<SubmitStateNotifierStates>('idle');
    const isReadOnly = !currentApp.permissions?.admin_application;

    const [saveApplication, {loading, error}] = useSaveApplicationMutation({
        onCompleted: () => {
            setSubmitState('success');
        },
        onError: () => {
            setSubmitState('error');
        }
    });

    useEffect(() => {
        if (loading) {
            setSubmitState('processing');
        }
    }, [loading]);

    const _handleTransparencyChange = async (checked: boolean) => {
        await saveApplication({
            variables: {
                application: {
                    id: currentApp.id,
                    settings: {
                        ...currentApp.settings,
                        showTransparency: checked
                    }
                }
            }
        });
    };

    return (
        <Form form={form}>
            <Form.Item label={t('app_settings.showTransparency')} name="showTransparency">
                <Space>
                    <Switch
                        aria-label="showTransparency"
                        disabled={isReadOnly}
                        onChange={_handleTransparencyChange}
                        defaultChecked={!!currentApp.settings?.showTransparency}
                    />
                    <SubmitStateNotifier state={submitState} />
                </Space>
            </Form.Item>
        </Form>
    );
}

export default AdvancedSettings;
