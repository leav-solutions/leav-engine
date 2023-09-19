// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {dsTheme, ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import {KitApp} from 'aristid-ds';
import App from 'components/App';
import React, {useEffect, useState} from 'react';
import i18n from './i18n';

export function Index() {
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
                <KitApp customTheme={dsTheme}>
                    <App />
                </KitApp>
            </React.StrictMode>
        )
    );
}
