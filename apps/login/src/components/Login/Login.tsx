// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSearchParams} from 'react-router-dom';
import LoginForm from './LoginForm';

const Login = (): JSX.Element => {
    const [searchParams] = useSearchParams();
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const authUrl = import.meta.env.VITE_AUTH_URL || '';

    const redirectTo = searchParams.get('dest') ?? '/';

    const _processLogin = async (login: string, password: string) => {
        try {
            setIsLoading(true);
            setLoginError('');

            const response = await fetch(authUrl, {
                method: 'POST',
                headers: new Headers([['Content-Type', 'application/json']]),
                body: JSON.stringify({
                    login,
                    password
                })
            });

            if (response.status === 401) {
                throw new Error(t('login.error.bad_credentials'));
            }

            if (!response.ok) {
                throw new Error(t('error.no_server_response'));
            }

            window.location.replace(redirectTo);
        } catch (err) {
            let msg = err.message;

            if (err.message.indexOf('NetworkError') > -1) {
                msg = t('error.no_server_response');
            }

            setLoginError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return <LoginForm onSubmit={_processLogin} loading={isLoading} loginError={loginError} />;
};
export default Login;
