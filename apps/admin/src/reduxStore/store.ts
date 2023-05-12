// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import messagesReducer from './messages/messages';
import mutationsWatcherReducer from './mutationsWatcher/mutationsWatcher';
import tasksReducer from './tasks/tasks';

export const store = configureStore({
    reducer: {
        messages: messagesReducer,
        mutationsWatcher: mutationsWatcherReducer,
        tasks: tasksReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
