// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {RootState} from 'reduxStore/store';
import {mockInitialState} from './mockInitialState';

const mockStore = configureStore();

interface IMockReduxProps {
    state?: Partial<RootState>;
    children: React.ReactNode;
}

const MockStore = ({state, children}: IMockReduxProps) => {
    const store = mockStore({...mockInitialState, ...state});
    return <Provider store={store}>{children}</Provider>;
};

export default MockStore;
