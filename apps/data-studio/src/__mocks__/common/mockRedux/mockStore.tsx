import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {type RootState} from '../../../reduxStore/store';
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
