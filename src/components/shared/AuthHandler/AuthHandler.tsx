import React, {useState} from 'react';

import App from '../../app/App';
import Login from '../Login';

interface IAuthHandlerProps {
    url: string;
}

function AuthHandler({url}: IAuthHandlerProps): JSX.Element {
    const [token, setToken] = useState(window.sessionStorage.accessToken || '');
    const [internalMessage, setInternalMessage] = useState('');

    // to be passed to Login
    const recordToken = (tokenStr: string) => {
        window.sessionStorage.setItem('accessToken', tokenStr);
        setToken(tokenStr);
    };

    // to be passed to App, allowing to handle the expiration of the token
    // and error handling
    const deleteToken = (message?: string) => {
        window.sessionStorage.removeItem('accessToken');
        setToken('');
        if (message) {
            setInternalMessage(message);
        }
    };

    if (token) {
        return <App token={token} onTokenInvalid={deleteToken} />;
    } else {
        return <Login onSuccess={recordToken} message={internalMessage} url={url} />;
    }
}

export default AuthHandler;
