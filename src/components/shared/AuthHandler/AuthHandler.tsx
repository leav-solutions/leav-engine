// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState, Suspense} from 'react';
// import Loader from '../Loading';
import App from '../../app/App';
import Login from '../Login';

interface IAuthHandlerProps {
    url: string;
    storage: Storage;
}

function AuthHandler({url, storage = window.sessionStorage}: IAuthHandlerProps): JSX.Element {
    const [token, setToken] = useState(storage.getItem('accessToken') || '');
    const [internalMessage, setInternalMessage] = useState('');

    // to be passed to Login
    const recordToken = (tokenStr: string) => {
        storage.setItem('accessToken', tokenStr);
        setToken(tokenStr);
    };

    // to be passed to App, allowing to handle the expiration of the token
    // and error handling
    const deleteToken = (message?: string) => {
        storage.removeItem('accessToken');
        setToken('');
        if (message) {
            setInternalMessage(message);
        }
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
