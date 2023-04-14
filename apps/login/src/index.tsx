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
import useAppLang from './hooks/useAppLang';
import Loading from 'components/shared/Loading';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {APPS_ENDPOINT, APP_ENDPOINT} from './constants';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function Index() {
    const {lang, loading, error} = useAppLang();
    const [i18nIsInitialized, seti18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized && lang) {
            i18n.init(`${APPS_ENDPOINT}/${APP_ENDPOINT}`, lang);
            seti18nIsInitialized(true);
        }
    }, [lang]);

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        i18nIsInitialized && (
            <React.StrictMode>
                <ConfigProvider theme={customTheme}>
                    <App />
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
