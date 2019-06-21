import React, {useState, useCallback} from 'react';
import {Button} from 'semantic-ui-react';
interface ILoginProps {
    onSuccess: (token: string) => void;
}

const extractValueFromEventAndThen = next => event => {
    next(event.target.value);
};

function Login({onSuccess}: ILoginProps): JSX.Element {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [jwt, setJwt] = useState(false);
    const [loginError, setLoginError] = useState('');
    const authUrl = process.env.REACT_APP_AUTH_URL || '';
    const proceedAuth = useCallback(
        () => {
            setIsLoading(true);
            setLoginError('');
            setJwt(false);
            fetch(authUrl, {
                method: 'POST',
                headers: new Headers([['Content-Type', 'application/json']]),
                body: JSON.stringify({
                    login,
                    password
                })
            })
                .then(response => response.json())
                .then(
                    data => {
                        setIsLoading(false);
                        setJwt(data.token);
                        onSuccess(data.token);
                    },
                    error => {
                        setIsLoading(false);
                        let appError = '';
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            appError = error.response.data.message;
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js
                            appError = 'API not reachable';
                        } else {
                            // Something happened in setting up the request that triggered an Error
                        }
                        setLoginError(appError);
                    }
                );
        },
        [onSuccess, authUrl, login, password]
    );

    return (
        <div className="ui middle aligned center aligned grid">
            <div className="column">
                <h2 className="ui image header">
                    <div className="content">Log-in to your account</div>
                </h2>
                <form className="ui large form">
                    <div className="ui segment">
                        <div className="field">
                            <div className="ui left icon input ">
                                <i className="user icon" />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="E-mail address"
                                    autoFocus
                                    value={login}
                                    onChange={extractValueFromEventAndThen(setLogin)}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <div className="ui left icon input">
                                <i className="lock icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={extractValueFromEventAndThen(setPassword)}
                                />
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="ui icon message teal">
                                <i className="notched circle loading icon" />
                                <div className="content">
                                    <div className="header">Just one second</div>
                                    <p>We're authenticating you.</p>
                                </div>
                            </div>
                        ) : (
                            <Button
                                fluid
                                size="large"
                                primary
                                loading={isLoading}
                                disabled={isLoading}
                                onClick={proceedAuth}
                                type="submit"
                            >
                                Login
                            </Button>
                        )}
                    </div>
                </form>
                {loginError ? (
                    <div className="ui icon message red">
                        <i className="eye slash icon" />
                        <div className="content">
                            <div className="header">Sorry,</div>
                            <p>{loginError}</p>
                        </div>
                    </div>
                ) : null}
                {jwt ? (
                    <div className="ui icon message green">
                        <i className="id card outline icon" />
                        <div className="content">
                            <div className="header">Good,</div>
                            <p>Authentication successful !</p>
                        </div>
                    </div>
                ) : null}
                {jwt ? (
                    <div className="ui icon message green">
                        <i className="key icon" />
                        <pre className="content" style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>
                            <p>{jwt}</p>
                        </pre>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
export default Login;
