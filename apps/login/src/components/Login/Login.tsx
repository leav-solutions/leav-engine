// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useRefreshToken} from '@leav/ui';
import {useQueryParams} from 'hooks/useQueryParams';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AUTH_URL} from '../../constants';
import LoginForm from './LoginForm';

const Login = (): JSX.Element => {
    const params = useQueryParams();
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const {setRefreshToken} = useRefreshToken();

    const redirectTo = params.dest ?? '/';

    const _processLogin = async (login: string, password: string) => {
        try {
            setIsLoading(true);
            setLoginError('');

            const response = await fetch(AUTH_URL, {
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

            const data = await response.json();
            setRefreshToken(data.refreshToken);

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
