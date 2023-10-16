// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, LockOutlined, UserOutlined} from '@ant-design/icons';
import {Alert, Card, Form, Spin} from 'antd';
import {KitButton, KitInput} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
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
        <Wrapper>
            <LoginBlock
                title={<img src="/global-icon/small" height="100px" />}
                headStyle={{textAlign: 'center', padding: '1rem'}}
            >
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
            </LoginBlock>
        </Wrapper>
    );
};

export default LoginForm;
