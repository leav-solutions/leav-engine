import {type ReactNode} from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {type RootState} from '../reduxStore/store';

const mockStoreInitialState: RootState = {
    messages: {
        messages: [],
    },
    mutationsWatcher: {
        mutationsCount: 0,
        hasPendingMutations: false,
    },
    tasks: {
        tasks: {},
    },
};

interface IMockReduxProps {
    state?: Partial<RootState>;
    children: ReactNode;
}

const mockStore = configureStore();

export const MockStore = ({state, children}: IMockReduxProps) => {
    const store = mockStore({...mockStoreInitialState, ...state});
    return <Provider store={store}>{children}</Provider>;
};
