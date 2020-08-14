import {LockOutlined, SendOutlined, UserOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, Spin} from 'antd';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styles from './login.module.css';

interface ILoginProps {
    url: string;
    onSuccess: (token: string) => void;
    message?: string;
}

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

const processLogin = (
    authUrl: string,
    login: string,
    password: string,
    setIsLoading: (n: boolean) => void,
    onSuccess: (n: string) => void,
    setLoginError: (n: string) => void
) => {
    fetch(authUrl, {
        method: 'POST',
        headers: new Headers([['Content-Type', 'application/json']]),
        body: JSON.stringify({
            login,
            password
        })
    })
        .then(
            response => {
                if (response.ok) {
                    return response;
                } else {
                    if (response.status === 401) {
                        throw new Error('bad_credentials');
                    }
                    throw new Error('no_server_response');
                }
            },
            error => {
                throw new Error('no_server_response');
            }
        )
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            onSuccess(data.token);
        })
        .catch(error => {
            setIsLoading(false);
            setLoginError(error.message);
        });
};

const Login = ({onSuccess, message, url}: ILoginProps): JSX.Element => {
    const {t} = useTranslation();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const authUrl = url;

    const proceedAuth = useCallback(() => {
        setIsLoading(true);
        setLoginError('');
        setTimeout(() => {
            processLogin(authUrl, login, password, setIsLoading, onSuccess, setLoginError);
        }, 2000);
    }, [onSuccess, authUrl, login, password]);

    return (
        <>
            <div className={styles.loginBackground} />
            <div className={styles.loginContainer}>
                <Card title={<h2>{t('login.header')}</h2>} style={{width: '30rem'}}>
                    <Form>
                        <Form.Item>
                            <Input
                                prefix={<UserOutlined />}
                                type="text"
                                name="email"
                                placeholder={t('login.email')}
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
                                placeholder={t('login.password')}
                                value={password}
                                onChange={extractValueFromEventAndThen(setPassword)}
                            />
                        </Form.Item>
                        <Form.Item>
                            {isLoading ? (
                                <Alert
                                    message={t('login.loading.header')}
                                    description={t('login.loading.text')}
                                    icon={<Spin />}
                                    type="warning"
                                    showIcon
                                />
                            ) : (
                                <Button
                                    size="large"
                                    type="primary"
                                    loading={isLoading}
                                    disabled={isLoading}
                                    onClick={proceedAuth}
                                    htmlType="submit"
                                    icon={<SendOutlined />}
                                    block
                                >
                                    {t('login.submit')}
                                </Button>
                            )}
                        </Form.Item>
                    </Form>
                    {loginError ? (
                        <Alert
                            message={t('login.apologize')}
                            description={t('login.error.' + loginError)}
                            type="error"
                            showIcon
                        />
                    ) : null}
                    {message ? (
                        <Alert message={t('login.apologize')} description={t(message)} type="warning" showIcon />
                    ) : null}
                </Card>
            </div>
        </>
    );
};
export default Login;
