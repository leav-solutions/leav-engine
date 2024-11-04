// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Loading, SimpleErrorBoundary} from '@leav/ui';
import {FunctionComponent, Suspense} from 'react';
import {Provider} from 'react-redux';
import store from 'reduxStore/store';
import ApolloHandler from './ApolloHandler';
import AppHandler from './AppHandler';
import './App.css';

const App: FunctionComponent = () => (
    <SimpleErrorBoundary>
        <Provider store={store}>
            <Suspense fallback={<Loading />}>
                <ApolloHandler>
                    <AppHandler />
                </ApolloHandler>
            </Suspense>
        </Provider>
    </SimpleErrorBoundary>
);

export default App;
