// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from 'components/ApolloHandler';
import App from 'components/App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <ApolloHandler>
            <App />
        </ApolloHandler>
    </React.StrictMode>
);
