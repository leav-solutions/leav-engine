// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Provider} from 'react-redux';
import store from 'redux/store';
import ApolloHandler from './ApolloHandler';
import './App.css';
import ThemeHandler from './ThemeHandler';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

function App({token, onTokenInvalid}: IAppProps) {
    return (
        <Provider store={store}>
            <ApolloHandler token={token} onTokenInvalid={onTokenInvalid}>
                <ThemeHandler />
            </ApolloHandler>
        </Provider>
    );
}

export default App;
