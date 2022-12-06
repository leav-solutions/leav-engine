// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApolloHandler from 'components/app/ApolloHandler';
import App from 'components/app/App';
import 'fomantic-ui-less/semantic.less';
import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from 'redux/store';
import {Loader} from 'semantic-ui-react';
import './i18n';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Suspense fallback={<Loader active inline="centered" style={{margin: '15rem auto'}} />}>
        <ReduxProvider store={store}>
            <ApolloHandler>
                <App />
            </ApolloHandler>
        </ReduxProvider>
    </Suspense>,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
