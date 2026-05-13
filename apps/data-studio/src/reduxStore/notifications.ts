import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type INotificationsState} from './stateType';

export const notificationsInitialState: INotificationsState = {
    isPanelOpen: false,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: notificationsInitialState,
    reducers: {
        setIsPanelOpen: (state, action: PayloadAction<boolean>) => {
            state.isPanelOpen = action.payload;
        },
    },
});

export const {setIsPanelOpen} = notificationsSlice.actions;

export default notificationsSlice.reducer;
