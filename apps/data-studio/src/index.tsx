// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {customTheme} from '@leav/ui';
import {ConfigProvider} from 'antd';
import 'antd/dist/reset.css';
import App from 'components/app';
import {createRoot} from 'react-dom/client';
import i18n from './i18n';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {useEffect, useState} from 'react';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {APPS_ENDPOINT, APP_ENDPOINT, ORIGIN_URL} from './constants';
import useAppLang from 'hooks/useAppLang/useAppLang';

const root = createRoot(document.getElementById('root') as HTMLElement);

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
            <ConfigProvider theme={customTheme}>
                <App />
            </ConfigProvider>
        )
    );
}

root.render(<Index />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
