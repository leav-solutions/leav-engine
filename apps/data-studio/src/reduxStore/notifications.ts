// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {INotificationsState} from './stateType';

export const notificationsInitialState: INotificationsState = {
    isPanelOpen: false
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: notificationsInitialState,
    reducers: {
        setIsPanelOpen: (state, action: PayloadAction<boolean>) => {
            state.isPanelOpen = action.payload;
        }
    }
});

export const {setIsPanelOpen} = notificationsSlice.actions;

export default notificationsSlice.reducer;
