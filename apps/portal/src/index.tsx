// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import ApolloHandler from 'components/ApolloHandler';
import App from 'components/App';
import React, {Suspense, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './i18n';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function Index() {
    const {lang, loading, error} = useAppLang();
    const [i18nIsInitialized, seti18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized && lang) {
            i18n.init(lang);
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
                <Suspense fallback={<Loading />}>
                    <ApolloHandler>
                        <App />
                    </ApolloHandler>
                </Suspense>
            </React.StrictMode>
        )
    );
}

root.render(<Index />);
