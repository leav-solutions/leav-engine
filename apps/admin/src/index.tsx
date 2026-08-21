import ApolloHandler from './components/app/ApolloHandler';
import App from './components/app/App';
import ErrorDisplay from './components/shared/ErrorDisplay';
import './semantic-ui/semantic.less';
import {Suspense, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './reduxStore/store';
import {Loader} from 'semantic-ui-react';
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
            i18n.init(lang);
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
                        <KitApp
                            locale={{
                                locale: localeByLang[lang],
                            }}
                        >
                            <App />
                        </KitApp>
                    </ApolloHandler>
                </ReduxProvider>
            </Suspense>
        )
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Index />);

registerServiceWorker();
