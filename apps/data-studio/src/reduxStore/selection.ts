import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type SharedStateSelection, SharedStateSelectionType} from '../_types/types';
import {type ISelectionState} from './stateType';

export const selectionInitialState: ISelectionState = {
    selection: {
        type: SharedStateSelectionType.SEARCH,
        selected: [],
    },
    searchSelection: {
        type: SharedStateSelectionType.SEARCH,
        selected: [],
    },
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
            if (state.selection.type === SharedStateSelectionType.SEARCH && state.selection.allSelected) {
                state.selection.allSelected = false;
            }
        },
    },
});

export const {setSelection, resetSelection} = selectionSlice.actions;

export default selectionSlice.reducer;
