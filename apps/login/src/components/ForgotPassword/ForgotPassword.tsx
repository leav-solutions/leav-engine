// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import i18n from 'i18next';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPassword = (): JSX.Element => {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
    const forgotPasswordUrl = import.meta.env.VITE_FORGOT_PASSWORD || '';

    const _processForgotPassword = async (email: string) => {
        try {
            setIsLoading(true);
            setForgotPasswordError('');
            setForgotPasswordSuccess('');

            const response = await fetch(forgotPasswordUrl, {
                method: 'POST',
                headers: new Headers([['Content-Type', 'application/json']]),
                body: JSON.stringify({
                    email,
                    lang: i18n.language
                })
            });

            if (response.status === 400) {
                throw new Error(t('error.missing_parameters'));
            }

            if (response.status === 401) {
                throw new Error(t('forgotPassword.error.user_not_found'));
            }

            if (response.status === 200) {
                setForgotPasswordSuccess(t('forgotPassword.success'));
            }

            if (!response.ok) {
                throw new Error(t('error.no_server_response'));
            }
        } catch (err) {
            let msg = err.message;

            if (err.message.indexOf('NetworkError') > -1) {
                msg = t('error.no_server_response');
            }

            setForgotPasswordError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ForgotPasswordForm
            onSubmit={_processForgotPassword}
            loading={isLoading}
            forgotPasswordError={forgotPasswordError}
            forgotPasswordSuccess={forgotPasswordSuccess}
        />
    );
};
export default ForgotPassword;
