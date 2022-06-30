// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorBoundary from 'components/shared/ErrorBoundary';
import Loading from 'components/shared/Loading';
import React, {Suspense} from 'react';
import {Provider} from 'react-redux';
import store from 'redux/store';
import ApolloHandler from './ApolloHandler';
import './App.css';
import ThemeHandler from './ThemeHandler';

function App() {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <Suspense fallback={<Loading />}>
                    <ApolloHandler>
                        <ThemeHandler />
                    </ApolloHandler>
                </Suspense>
            </Provider>
        </ErrorBoundary>
    );
}

export default App;
