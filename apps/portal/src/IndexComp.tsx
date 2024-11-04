// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import ApolloHandler from 'components/ApolloHandler';
import App from 'components/App';
import React, {Suspense, useEffect, useState} from 'react';
import i18n from './i18n';

export function IndexComp() {
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
