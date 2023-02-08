// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TypeSideItem} from '_types/types';
import {IDisplaySide, IDisplayState} from './stateType';

export const displayInitialState: IDisplayState = {
    side: {
        visible: false,
        type: TypeSideItem.filters
    }
};

const displaySlice = createSlice({
    name: 'display',
    initialState: displayInitialState,
    reducers: {
        setDisplaySide: (state, action: PayloadAction<IDisplaySide>) => {
            state.side = action.payload;
        }
    }
});

export const {setDisplaySide} = displaySlice.actions;

export default displaySlice.reducer;
