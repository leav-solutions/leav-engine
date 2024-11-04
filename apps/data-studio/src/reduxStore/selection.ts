// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SharedStateSelection, SharedStateSelectionType} from '_types/types';
import {ISelectionState} from './stateType';

export const selectionInitialState: ISelectionState = {
    selection: {
        type: SharedStateSelectionType.search,
        selected: []
    },
    searchSelection: {
        type: SharedStateSelectionType.search,
        selected: []
    }
};

const selectionSlice = createSlice({
    name: 'filters',
    initialState: selectionInitialState,
    reducers: {
        setSelection: (state, action: PayloadAction<SharedStateSelection>) => {
            state.selection = action.payload;
        },
        resetSelection: state => {
            state.selection.selected = [];
            if (state.selection.type === SharedStateSelectionType.search && state.selection.allSelected) {
                state.selection.allSelected = false;
            }
        }
    }
});

export const {setSelection, resetSelection} = selectionSlice.actions;

export default selectionSlice.reducer;
