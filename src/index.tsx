import React from 'react';
import ReactDOM from 'react-dom';
import AuthHandler from './components/shared/AuthHandler';
import './i18n';
import './index.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <React.Fragment>
        <AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} storage={window.sessionStorage} />
    </React.Fragment>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
