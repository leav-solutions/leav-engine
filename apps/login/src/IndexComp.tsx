// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import App from 'components/App';
import ContentWrapper from 'components/ContentWrapper';
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

    const _renderContent = (content: JSX.Element) => <ContentWrapper>{content}</ContentWrapper>;

    if (error) {
        return _renderContent(<ErrorDisplay message={error} />);
    }

    if (loading) {
        return _renderContent(<Loading />);
    }

    return i18nIsInitialized && <React.StrictMode>{_renderContent(<App />)}</React.StrictMode>;
}
