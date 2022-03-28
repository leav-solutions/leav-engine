// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useAuthToken} from '@leav/utils';
import ApolloHandler from 'components/app/ApolloHandler';
import React, {Suspense, useState} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from '../../../redux/store';
import App from '../../app/App';
import Login from '../Login';

interface IAuthHandlerProps {
    url: string;
}

function AuthHandler({url}: IAuthHandlerProps): JSX.Element {
    const {getToken, saveToken, deleteToken} = useAuthToken();
    const [token, setToken] = useState(getToken());
    const [internalMessage, setInternalMessage] = useState('');

    const _onLoginSuccess = (tokenStr: string) => {
        saveToken(tokenStr);
        setToken(tokenStr);
    };

    // to be passed to App, allowing to handle the expiration of the token
    // and error handling
    const _handleTokenInvalid = (message?: string) => {
        deleteToken();
        setToken('');

        if (message) {
            setInternalMessage(message);
        }
    };

    if (getToken()) {
        return (
            <Suspense fallback={'Loader'}>
                <ReduxProvider store={store}>
                    <ApolloHandler token={token} onTokenInvalid={_handleTokenInvalid}>
                        <App />
                    </ApolloHandler>
                </ReduxProvider>
            </Suspense>
        );
    } else {
        return (
            <Suspense fallback={'Loader'}>
                <Login onSuccess={_onLoginSuccess} message={internalMessage} url={url} />
            </Suspense>
        );
    }
}

export default AuthHandler;
