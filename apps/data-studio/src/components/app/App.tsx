// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Loading,SimpleErrorBoundary} from '@leav/ui';
import {Suspense} from 'react';
import {Provider} from 'react-redux';
import store from 'reduxStore/store';
import ApolloHandler from './ApolloHandler';
import './App.css';
import AppHandler from './AppHandler';

function App() {
    return (
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
}

export default App;
