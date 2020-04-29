import React, {useCallback, useState} from 'react';
import {Button} from 'semantic-ui-react';
import styles from './login.module.css';

interface ILoginProps {
    url: string;
    onSuccess: (token: string) => void;
    message?: string;
}

const extractValueFromEventAndThen = (next: any) => (event: any) => {
    next(event.target.value);
};

const processLogin = (
    authUrl: string,
    login: string,
    password: string,
    setIsLoading: (n: boolean) => void,
    onSuccess: (n: string) => void,
    setLoginError: (n: string) => void
) => {
    fetch(authUrl, {
        method: 'POST',
        headers: new Headers([['Content-Type', 'application/json']]),
        body: JSON.stringify({
            login,
            password
        })
    })
        .then(
            response => {
                console.log(response);
                if (response.ok) {
                    return response;
                } else {
                    if (response.status === 401) {
                        throw new Error('bad_credentials');
                    }
                    throw new Error('no_server_response');
                }
            },
            error => {
                throw new Error('no_server_response');
            }
        )
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            onSuccess(data.token);
        })
        .catch(error => {
            setIsLoading(false);
            setLoginError(error.message);
        });
};

const Login = ({onSuccess, message, url}: ILoginProps): JSX.Element => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const authUrl = url;

    const proceedAuth = useCallback(() => {
        setIsLoading(true);
        setLoginError('');
        setTimeout(() => {
            processLogin(authUrl, login, password, setIsLoading, onSuccess, setLoginError);
        }, 2000);
    }, [onSuccess, authUrl, login, password]);

    return (
        <>
            <div className={styles.loginBackground} />
            <div className={`ui middle aligned center aligned grid ${styles.loginContainer}`}>
                <div className={`column ${styles.loginBlock}`}>
                    <h2 className={`${styles.loginHeader} ui image header`}>Authentification</h2>
                    <form className="ui large form">
                        <div className="ui segment">
                            <div className="field">
                                <div className="ui left icon input ">
                                    <i className="user icon" />
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email address"
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
                                        placeholder="password"
                                        value={password}
                                        onChange={extractValueFromEventAndThen(setPassword)}
                                    />
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="ui icon message teal">
                                    <i className="notched circle loading icon" />
                                    <div className="content">
                                        <div className="header">Just a second,</div>
                                        <p>we are authenticating you...</p>
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
                                    icon
                                    labelPosition="left"
                                >
                                    <i className="send icon" />
                                    Submit
                                </Button>
                            )}
                        </div>
                    </form>
                    {loginError ? (
                        <div className="ui icon message red">
                            <i className="lock icon" />
                            <div className="content">
                                <div className="header">We are sorry,</div>
                                <p>we were not able to authenticate you :</p>
                                <p>{loginError}</p>
                            </div>
                        </div>
                    ) : null}
                    {message ? (
                        <div className="ui icon message orange">
                            <i className="lock icon" />
                            <div className="content">
                                <p>we were not able to authenticate you :</p>
                                <p>{message}</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};
export default Login;
