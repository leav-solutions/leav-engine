// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownOutlined, LockOutlined, SendOutlined, CheckOutlined, ExclamationOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Spin} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Background = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(to right bottom, #2185d0, #009ad7, #00aabf, #00b58a, #21ba45);
    background-size: 200% 100%;
    animation: Gradient 15s ease infinite;
    z-index: -1;

    @keyframes Gradient {
        0% {
            background-position: 0% 0%;
        }

        50% {
            background-position: 100% 0%;
        }

        100% {
            background-position: 0% 0%;
        }
    }
`;

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`;

const ForgotPasswordBlock = styled(Card)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`;

interface IForgotPasswordFormProps {
    onSubmit: (email: string) => void;
    loading: boolean;
    forgotPasswordError: string;
    forgotPasswordSuccess: string;
}

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

const ForgotPasswordForm = ({
    onSubmit,
    loading,
    forgotPasswordError,
    forgotPasswordSuccess
}: IForgotPasswordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [email, setEmail] = useState('');

    const _processForgotPassword = async () => {
        onSubmit(email);
    };

    return (
        <>
            <Background />
            <Wrapper>
                <ForgotPasswordBlock
                    title={
                        <>
                            <h2>LEAV Engine</h2>
                            {t('forgotPassword.header')}
                        </>
                    }
                    style={{width: '30rem'}}
                >
                    <Form onFinish={_processForgotPassword}>
                        <Form.Item
                            hasFeedback
                            name="newPassword"
                            rules={[
                                {type: 'email', message: t('forgotPassword.email_not_valid')},
                                {required: true, message: t('forgotPassword.email_required')}
                            ]}
                        >
                            <Input
                                aria-label={t('forgotPassword.email')}
                                placeholder={t('forgotPassword.email')}
                                autoFocus
                                value={email}
                                onChange={extractValueFromEventAndThen(setEmail)}
                            />
                        </Form.Item>
                        {loading && (
                            <Form.Item>
                                <Alert
                                    message={t('forgotPassword.loading.header')}
                                    description={t('forgotPassword.loading.text')}
                                    icon={<Spin />}
                                    type="warning"
                                    showIcon
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
                                    icon={<SendOutlined />}
                                    block
                                >
                                    {t('forgotPassword.submit')}
                                </Button>
                            </Form.Item>
                        )}
                    </Form>
                    {forgotPasswordError && (
                        <Alert
                            message={forgotPasswordError}
                            type="error"
                            showIcon
                            icon={<ExclamationOutlined style={{fontSize: '1.5em'}} />}
                        />
                    )}
                    {forgotPasswordSuccess && (
                        <Alert
                            message={forgotPasswordSuccess}
                            type="success"
                            showIcon
                            icon={<CheckOutlined style={{fontSize: '1.5em'}} />}
                        />
                    )}
                </ForgotPasswordBlock>
            </Wrapper>
        </>
    );
};

export default ForgotPasswordForm;
