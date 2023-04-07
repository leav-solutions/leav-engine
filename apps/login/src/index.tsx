// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {customTheme} from '@leav/ui';
import {ConfigProvider} from 'antd';
import App from 'components/App';
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import i18n from './i18n';
import i18next from 'i18next';
import useAppLang from './useAppLang';

// Get endpoint app current from url /app/:endpoint
export const APPS_URL_PREFIX = 'app';
export const ENDPOINT = window.location.pathname.split('/').filter(e => e)[1];
export const BASENAME = `${APPS_URL_PREFIX}/${ENDPOINT}`;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function Index() {
    const appLang = useAppLang();
    const [i18nIsInitialized, seti18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized) {
            i18n.init(BASENAME, appLang);
            seti18nIsInitialized(true);
        }
    }, []);

    return (
        i18nIsInitialized && (
            <React.StrictMode>
                <ConfigProvider theme={customTheme}>
                    <App basename={BASENAME} />
                </ConfigProvider>
            </React.StrictMode>
        )
    );
}

root.render(<Index />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
