// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import ResetPasswordForm from './ResetPasswordForm';
import {RESET_PASSWORD_URL} from '../../constants';

const ResetPassword = (): JSX.Element => {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [resetPasswordError, setResetPasswordError] = useState('');

    const {token} = useParams<{token: string}>();
    const redirectTo = '/';

    const _processResetPassword = async (newPassword: string) => {
        try {
            setIsLoading(true);
            setResetPasswordError('');

            const response = await fetch(RESET_PASSWORD_URL, {
                method: 'POST',
                headers: new Headers([['Content-Type', 'application/json']]),
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            if (response.status === 400) {
                throw new Error(t('error.missing_parameters'));
            }

            if (response.status === 401) {
                throw new Error(t('resetPassword.error.invalid_token'));
            }

            if (response.status === 422) {
                throw new Error(t('resetPassword.error.invalid_password'));
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

            setResetPasswordError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResetPasswordForm
            onSubmit={_processResetPassword}
            loading={isLoading}
            resetPasswordError={resetPasswordError}
        />
    );
};
export default ResetPassword;
