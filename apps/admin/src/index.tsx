// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from './components/app/ApolloHandler';
import App from './components/app/App';
import {InitRouting} from './config/router/InitRouting';
import ErrorDisplay from './components/shared/ErrorDisplay';
import 'fomantic-ui-less/semantic.less';
import {Suspense, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './reduxStore/store';
import {Loader} from 'semantic-ui-react';
import {APP_BASE_URL} from './constants';
import useAppLang from './hooks/useAppLang';
import i18n from './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import {KitApp} from 'aristid-ds';

export function Index() {
    const {lang, loading, error} = useAppLang();
    const [i18nIsInitialized, seti18nIsInitialized] = useState(false);

    useEffect(() => {
        if (!i18nIsInitialized && lang) {
            i18n.init(APP_BASE_URL, lang);
            seti18nIsInitialized(true);
        }
    }, [lang]);

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (loading) {
        return <Loader active inline="centered" style={{margin: '15rem auto'}} />;
    }

    const localeByLang = {
        fr: 'frFR',
        en: 'enUS',
    };

    //TODO: Later like in app-studio, index should be used to init the network, translation, user, theme,notifications subscription, routing, application setting provider, document title, guard access, layout and application router with proper hooks (in config folder) to do that
    return (
        i18nIsInitialized && (
            <Suspense fallback={<Loader active inline="centered" style={{margin: '15rem auto'}} />}>
                <ReduxProvider store={store}>
                    <ApolloHandler>
                        <InitRouting>
                            <KitApp
                                locale={{
                                    locale: localeByLang[lang],
                                }}
                            >
                                <App />
                            </KitApp>
                        </InitRouting>
                    </ApolloHandler>
                </ReduxProvider>
            </Suspense>
        )
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Index />);

registerServiceWorker();
