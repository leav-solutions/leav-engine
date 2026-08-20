import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Form} from 'antd';
import {KitAlert, KitButton, KitInput} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

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
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const _processLogin = async () => {
        onSubmit(login, password);
    };

    const _handleClickForgotPassword = () => {
        navigate('/forgot-password');
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
                    <KitAlert
                        message={t('login.loading.header')}
                        description={t('login.loading.text')}
                        type="warning"
                        showIcon
                    />
                </Form.Item>
            )}
            {loginError && (
                <Form.Item>
                    <KitAlert message={loginError} type="error" showIcon />
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
