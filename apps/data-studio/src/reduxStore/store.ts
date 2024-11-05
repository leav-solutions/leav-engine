// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import activePanelReducer from './activePanel';
import infosReducer from './infos';
import navigationReducer from './navigation';
import notificationsReducer from './notifications';
import selectionReducer from './selection';
import tasksReducer from './tasks';

const store = configureStore({
    reducer: {
        selection: selectionReducer,
        navigation: navigationReducer,
        info: infosReducer,
        activePanel: activePanelReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<RootDispatch>();

export default store;
