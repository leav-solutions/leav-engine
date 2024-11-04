// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from 'components/app/ApolloHandler';
import App from 'components/app/App';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import 'fomantic-ui-less/semantic.less';
import {Suspense, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from 'reduxStore/store';
import {Loader} from 'semantic-ui-react';
import {APPS_ENDPOINT, APP_ENDPOINT} from './constants';
import useAppLang from './hooks/useAppLang';
import i18n from './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

export function Index() {
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
            <Suspense fallback={<Loader active inline="centered" style={{margin: '15rem auto'}} />}>
                <ReduxProvider store={store}>
                    <ApolloHandler>
                        <App />
                    </ApolloHandler>
                </ReduxProvider>
            </Suspense>
        )
    );
}

ReactDOM.render(<Index />, document.getElementById('root') as HTMLElement);

registerServiceWorker();
