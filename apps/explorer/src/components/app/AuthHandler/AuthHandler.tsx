// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useAuthToken from 'hooks/useAuthToken';
import React, {Suspense, useState} from 'react';
import Login from '../../shared/Login';
import App from '../App';

interface IAuthHandlerProps {
    url: string;
}

function AuthHandler({url}: IAuthHandlerProps): JSX.Element {
    const {getToken, saveToken, deleteToken: removeToken} = useAuthToken();
    const [token, setToken] = useState(getToken());
    const [internalMessage, setInternalMessage] = useState('');

    // to be passed to Login
    const recordToken = (tokenStr: string) => {
        saveToken(tokenStr);
        setToken(tokenStr);
    };

    // to be passed to App, allowing to handle the expiration of the token
    // and error handling
    const deleteToken = (message?: string) => {
        removeToken();
        setToken('');
        if (message) {
            setInternalMessage(message);
        }

        return <Login onSuccess={recordToken} message={internalMessage} url={url} />;
    };

    if (token) {
        return (
            <Suspense fallback={'Loader'}>
                <App token={token} onTokenInvalid={deleteToken} />
            </Suspense>
        );
    } else {
        return (
            <Suspense fallback={'Loader'}>
                <Login onSuccess={recordToken} message={internalMessage} url={url} />
            </Suspense>
        );
    }
}

export default AuthHandler;
