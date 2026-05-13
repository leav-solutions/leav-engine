import {ErrorDisplay, Loading, useAppLang} from '@leav/ui';
import {type FunctionComponent, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './components/app';
import {AntApp} from 'aristid-ds';
import i18n from './i18n';

import 'antd/dist/reset.css';
import './index.css';

export const Index: FunctionComponent = () => {
    const {lang, loading, error} = useAppLang();
    const [i18nIsInitialized, setI18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized && lang) {
            i18n.init(lang);
            setI18nIsInitialized(true);
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
            <AntApp>
                <App />
            </AntApp>
        )
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<Index />);
