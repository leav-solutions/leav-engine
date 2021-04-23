// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DisplaySize, TypeSideItem} from '_types/types';
import {IDisplaySide, IDisplayState} from './stateType';

export const displayInitialState: IDisplayState = {
    size: DisplaySize.small,
    side: {
        visible: false,
        type: TypeSideItem.filters
    }
};

const displaySlice = createSlice({
    name: 'display',
    initialState: displayInitialState,
    reducers: {
        setDisplaySize: (state, action: PayloadAction<DisplaySize>) => {
            state.size = action.payload;
        },
        setDisplaySide: (state, action: PayloadAction<IDisplaySide>) => {
            state.side = action.payload;
        },
        setDisplaySelectionMode: (state, action: PayloadAction<boolean>) => {
            state.selectionMode = action.payload;
        }
    }
});

export const {setDisplaySize, setDisplaySide, setDisplaySelectionMode} = displaySlice.actions;

export default displaySlice.reducer;
