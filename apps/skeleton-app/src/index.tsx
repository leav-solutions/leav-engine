// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import {FunctionComponent, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {initI18n} from './modules/translation/initI18n';

import 'antd/dist/reset.css';
import './index.css';

export const Index: FunctionComponent = () => {
    const {lang, loading, error} = useAppLang();
    const [i18nIsInitialized, setI18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized && lang) {
            initI18n(lang);
            setI18nIsInitialized(true);
        }
    }, [lang]);

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (loading) {
        return <Loading />;
    }

    return i18nIsInitialized && <App />;
};

const root = createRoot(document.getElementById('root'));
root.render(<Index />);
