// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {RootState} from 'redux/store';

export const mockStoreInitialState: RootState = {
    messages: {
        messages: []
    },
    mutationsWatcher: {
        mutationsCount: 0,
        hasPendingMutations: false
    },
    tasks: {
        tasks: {}
    }
};

interface IMockReduxProps {
    state?: Partial<RootState>;
    children: React.ReactNode;
}

export const MockStore = ({state, children}: IMockReduxProps) => {
    const mockStore = configureStore();
    const store = mockStore({...mockStoreInitialState, ...state});

    return <Provider store={store}>{children}</Provider>;
};
