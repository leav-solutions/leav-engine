// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    ISharedSelected,
    ISharedStateSelectionSearch,
    IToggleSelection,
    SharedStateSelection,
    SharedStateSelectionType
} from '_types/types';
import {ISelectionState} from './stateType';
import {toggleInSelection} from './utils';

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
        },
        setSelectionAllSelected: (state, action: PayloadAction<boolean>) => {
            if (state.selection.type === SharedStateSelectionType.search) {
                state.selection.allSelected = action.payload;
            }
        },
        setSelectionToggleSelected: (state, action: PayloadAction<IToggleSelection>) => {
            state.selection = toggleInSelection(state.selection, action.payload);
        },
        setSearchSelection: (state, action: PayloadAction<ISharedStateSelectionSearch>) => {
            state.searchSelection = action.payload;
        },
        resetSearchSelection: state => {
            state.searchSelection.selected = [];
            state.searchSelection.allSelected = false;
        },
        setSelectionToggleSearchSelectionElement: (state, action: PayloadAction<ISharedSelected>) => {
            const newSearchSelection = toggleInSelection(state.searchSelection, {
                selectionType: SharedStateSelectionType.search,
                elementSelected: action.payload
            });

            if (newSearchSelection.type === SharedStateSelectionType.search) {
                state.searchSelection = newSearchSelection;
            }
        }
    }
});

export const {
    setSelection,
    resetSelection,
    setSelectionAllSelected,
    setSelectionToggleSelected,
    setSearchSelection,
    resetSearchSelection,
    setSelectionToggleSearchSelectionElement
} = selectionSlice.actions;

export default selectionSlice.reducer;
