// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IBaseNotification, INotification, NotificationType} from '_types/types';
import {INotificationsState} from './stateType';

export const notificationsInitialState: INotificationsState = {
    stack: [],
    base: {
        content: '',
        type: NotificationType.basic
    }
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: notificationsInitialState,
    reducers: {
        setNotificationBase: (state, action: PayloadAction<IBaseNotification>) => {
            state.base = action.payload;
        },
        setNotificationStack: (state, action: PayloadAction<INotification[]>) => {
            state.stack = action.payload;
        },
        addNotification: (state, action: PayloadAction<INotification>) => {
            state.stack = [...state.stack, action.payload];
        }
    }
});

export const {setNotificationBase, setNotificationStack, addNotification} = notificationsSlice.actions;

export default notificationsSlice.reducer;
