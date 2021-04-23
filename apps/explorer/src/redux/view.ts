// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IView} from '_types/types';
import {IViewState} from './stateType';

export const viewInitialState: IViewState = {
    current: null,
    reload: false
};

const viewSlice = createSlice({
    name: 'view',
    initialState: viewInitialState,
    reducers: {
        setViewCurrent: (state, action: PayloadAction<IView | null>) => {
            state.current = action.payload;
        },
        setViewReload: (state, action: PayloadAction<boolean>) => {
            state.reload = action.payload;
        }
    }
});

export const {setViewCurrent, setViewReload} = viewSlice.actions;

export default viewSlice.reducer;
