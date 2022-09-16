// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import activePanelReducer from './activePanel';
import displayReducer from './display';
import navigationReducer from './navigation';
import infosReducer from './infos';
import selectionReducer from './selection';

const store = configureStore({
    reducer: {
        display: displayReducer,
        selection: selectionReducer,
        navigation: navigationReducer,
        info: infosReducer,
        activePanel: activePanelReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<RootDispatch>();

export default store;
