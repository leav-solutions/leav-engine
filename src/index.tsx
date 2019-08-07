import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import AuthHandler from './components/shared/AuthHandler';
import './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} />, document.getElementById(
    'root'
) as HTMLElement);

registerServiceWorker();
