import {configureStore} from '@reduxjs/toolkit';
import {type TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import messagesReducer from './messages/messages';
import mutationsWatcherReducer from './mutationsWatcher/mutationsWatcher';
import tasksReducer from './tasks/tasks';

export const store = configureStore({
    reducer: {
        messages: messagesReducer,
        mutationsWatcher: mutationsWatcherReducer,
        tasks: tasksReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
