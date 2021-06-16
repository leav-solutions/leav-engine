// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import displayReducer from './display';
import filtersReducer from './filters';
import navigationReducer from './navigation';
import notificationsReducer from './notifications';
import selectionReducer from './selection';
import viewReducer from './view';

const store = configureStore({
    reducer: {
        view: viewReducer,
        display: displayReducer,
        filters: filtersReducer,
        selection: selectionReducer,
        navigation: navigationReducer,
        notification: notificationsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<RootDispatch>();

export default store;
