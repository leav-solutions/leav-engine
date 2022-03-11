// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from 'components/app/ApolloHandler';
import React, {Suspense, useState} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from '../../../redux/store';
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
                <ReduxProvider store={store}>
                    <ApolloHandler token={token} onTokenInvalid={deleteToken}>
                        <App />
                    </ApolloHandler>
                </ReduxProvider>
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
