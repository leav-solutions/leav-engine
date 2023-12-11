// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, LockOutlined, UserOutlined} from '@ant-design/icons';
import {Alert, Form, Spin} from 'antd';
import {KitButton, KitInput} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

interface ILoginFormProps {
    onSubmit: (login: string, password: string) => void;
    loading: boolean;
    loginError: string;
}

const LoginForm = ({onSubmit, loading, loginError}: ILoginFormProps): JSX.Element => {
    const {t} = useTranslation();
    const history = useHistory();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const _processLogin = async () => {
        onSubmit(login, password);
    };

    const _handleClickForgotPassword = () => {
        history.push('/forgot-password');
    };

    return (
        <Form onFinish={_processLogin}>
            <Form.Item>
                <KitInput
                    prefix={<UserOutlined />}
                    name="login"
                    aria-label={t('login.login')}
                    placeholder={t('login.login')}
                    autoFocus
                    value={login}
                    onChange={extractValueFromEventAndThen(setLogin)}
                />
            </Form.Item>
            <Form.Item>
                <KitInput.Password
                    prefix={<LockOutlined />}
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
                <Form.Item style={{textAlign: 'center'}}>
                    <KitButton type="primary" loading={loading} disabled={loading} htmlType="submit">
                        {t('login.submit')}
                    </KitButton>
                </Form.Item>
            )}
            <Form.Item style={{textAlign: 'right'}}>
                <KitButton onClick={_handleClickForgotPassword} type="link">
                    {t('login.forgot_password')}
                </KitButton>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
