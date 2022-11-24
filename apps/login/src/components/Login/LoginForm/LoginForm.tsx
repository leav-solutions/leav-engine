// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, LockOutlined, UserOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Spin, Space} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

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

const LoginBlock = styled(Card)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`;

interface ILoginFormProps {
    onSubmit: (login: string, password: string) => void;
    loading: boolean;
    loginError: string;
}

const LoginForm = ({onSubmit, loading, loginError}: ILoginFormProps): JSX.Element => {
    const {t} = useTranslation();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const _processLogin = async () => {
        onSubmit(login, password);
    };

    return (
        <>
            <Background />
            <Wrapper>
                <LoginBlock title={<h2>LEAV Engine</h2>}>
                    <Form onFinish={_processLogin}>
                        <Form.Item>
                            <Input
                                prefix={<UserOutlined />}
                                type="text"
                                name="login"
                                aria-label={t('login.login')}
                                placeholder={t('login.login')}
                                autoFocus
                                value={login}
                                onChange={extractValueFromEventAndThen(setLogin)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                prefix={<LockOutlined />}
                                type="password"
                                name="password"
                                aria-label={t('login.password')}
                                placeholder={t('login.password')}
                                value={password}
                                onChange={extractValueFromEventAndThen(setPassword)}
                            />
                        </Form.Item>
                        {loading && (
                            <Form.Item>
                                <Alert
                                    message={t('login.loading.header')}
                                    description={t('login.loading.text')}
                                    icon={<Spin />}
                                    type="warning"
                                    showIcon
                                />
                            </Form.Item>
                        )}
                        {loginError && (
                            <Form.Item>
                                <Alert
                                    message={loginError}
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
                                    {t('login.submit')}
                                </Button>
                            </Form.Item>
                        )}
                        <Form.Item>
                            <a
                                style={{float: 'right'}}
                                href={(process.env.REACT_APP_ENDPOINT ?? '/') + '/forgot-password'}
                            >
                                {t('login.forgot_password')}
                            </a>
                        </Form.Item>
                    </Form>
                </LoginBlock>
            </Wrapper>
        </>
    );
};

export default LoginForm;
