// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import 'fomantic-ui-css/semantic.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import AuthHandler from './components/shared/AuthHandler';
import './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} storage={window.sessionStorage} />,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
