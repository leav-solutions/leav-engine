// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Alert, Card, Form, Spin} from 'antd';
import {KitButton, KitInput, KitTypography} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`;

const ResetPasswordBlock = styled(Card)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`;

interface IResetPasswordFormProps {
    onSubmit: (newPassword: string) => void;
    loading: boolean;
    resetPasswordError: string;
}

const ResetPasswordForm = ({onSubmit, loading, resetPasswordError}: IResetPasswordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const _processResetPassword = async () => {
        onSubmit(newPassword);
    };

    return (
        <>
            <KitTypography.Title level="h3"> {t('resetPassword.header')}</KitTypography.Title>
            <Form onFinish={_processResetPassword}>
                <Form.Item
                    hasFeedback
                    name="newPassword"
                    rules={[{required: true, message: t('resetPassword.new_password_required')}]}
                >
                    <KitInput.Password
                        aria-label={t('resetPassword.new_password')}
                        placeholder={t('resetPassword.new_password')}
                        autoFocus
                        value={newPassword}
                        onChange={extractValueFromEventAndThen(setNewPassword)}
                    />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        {required: true, message: t('resetPassword.confirm_password_required')},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                return !value || getFieldValue('newPassword') === value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error(t('resetPassword.wrong_confirm_password')));
                            }
                        })
                    ]}
                >
                    <KitInput.Password
                        aria-label={t('resetPassword.confirm_password')}
                        placeholder={t('resetPassword.confirm_password')}
                        value={confirmPassword}
                        onChange={extractValueFromEventAndThen(setConfirmPassword)}
                    />
                </Form.Item>
                {loading && (
                    <Form.Item>
                        <Alert
                            message={t('resetPassword.loading.header')}
                            description={t('resetPassword.loading.text')}
                            icon={<Spin />}
                            type="warning"
                            showIcon
                        />
                    </Form.Item>
                )}
                {resetPasswordError && (
                    <Form.Item>
                        <Alert
                            message={resetPasswordError}
                            type="error"
                            showIcon
                            icon={<CloseOutlined style={{fontSize: '1.5em'}} />}
                        />
                    </Form.Item>
                )}
                {!loading && (
                    <Form.Item style={{textAlign: 'center'}}>
                        <KitButton type="primary" loading={loading} disabled={loading} htmlType="submit" block>
                            {t('resetPassword.submit')}
                        </KitButton>
                    </Form.Item>
                )}
            </Form>
        </>
    );
};

export default ResetPasswordForm;
