import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export interface IMutationsWatcherReducerState {
    mutationsCount: number;
    hasPendingMutations: boolean;
}

export const initialState: IMutationsWatcherReducerState = {
    mutationsCount: 0,
    hasPendingMutations: false,
};

export const mutationsWatcherSlice = createSlice({
    name: 'mutationsWatcher',
    initialState,
    reducers: {
        startMutation: (state, action: PayloadAction) => {
            state.mutationsCount++;
            state.hasPendingMutations = true;
        },
        endMutation: (state, action: PayloadAction) => {
            state.mutationsCount--;
            state.hasPendingMutations = state.mutationsCount > 0;
        },
    },
});

// Action creators are generated for each case reducer function
export const {startMutation, endMutation} = mutationsWatcherSlice.actions;

export default mutationsWatcherSlice.reducer;
