import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './components/app/App';
import Login from './components/shared/Login';
import './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const setToken = (tokenStr: string) => {
    window.sessionStorage.setItem('accessToken', tokenStr);
    ReactDOM.render(<App token={tokenStr} />, document.getElementById('root') as HTMLElement);
};
const token = window.sessionStorage.accessToken || '';

window.sessionStorage.accessToken = token;
if (token === '') {
    // window.location.replace(`${authAppUrl}?referer=${window.location}`);
    ReactDOM.render(<Login onSuccess={setToken} />, document.getElementById('root') as HTMLElement);
} else {
    ReactDOM.render(<App token={token} />, document.getElementById('root') as HTMLElement);
}

registerServiceWorker();
