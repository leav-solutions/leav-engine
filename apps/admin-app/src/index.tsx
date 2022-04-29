// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from 'components/app/ApolloHandler';
import App from 'components/app/App';
import 'fomantic-ui-css/semantic.min.css';
import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from 'redux/store';
import './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Suspense fallback={'Loader'}>
        <ReduxProvider store={store}>
            <ApolloHandler>
                <App />
            </ApolloHandler>
        </ReduxProvider>
    </Suspense>,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
