// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Spin} from 'antd';
import React, {useState} from 'react';
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
        <Wrapper>
            <ResetPasswordBlock
                title={
                    <img
                        src={`${process.env.REACT_APP_ENDPOINT}/assets/logo-leavengine.png`}
                        alt="LEAV Engine"
                        height="100px"
                    />
                }
                headStyle={{textAlign: 'center'}}
                style={{width: '30rem'}}
            >
                <h3> {t('resetPassword.header')}</h3>
                <Form onFinish={_processResetPassword}>
                    <Form.Item
                        hasFeedback
                        name="newPassword"
                        rules={[{required: true, message: t('resetPassword.new_password_required')}]}
                    >
                        <Input.Password
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
                        <Input.Password
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
                        <Form.Item>
                            <Button
                                size="large"
                                type="primary"
                                loading={loading}
                                disabled={loading}
                                htmlType="submit"
                                block
                            >
                                {t('resetPassword.submit')}
                            </Button>
                        </Form.Item>
                    )}
                </Form>
            </ResetPasswordBlock>
        </Wrapper>
    );
};

export default ResetPasswordForm;
