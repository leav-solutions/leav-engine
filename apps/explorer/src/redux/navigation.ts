// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GET_TREE_CONTENT_treeContent} from '_gqlTypes/GET_TREE_CONTENT';
import {INavigationState} from './stateType';

export const navigationInitialState: INavigationState = {
    activeTree: '',
    path: []
};

const navigationSlice = createSlice({
    name: 'display',
    initialState: navigationInitialState,
    reducers: {
        setNavigationActiveTree: (state, action: PayloadAction<string>) => {
            if (state.activeTree !== action.payload) {
                state.activeTree = action.payload;
                state.path = [];
            }
        },
        setNavigationPath: (state, action: PayloadAction<GET_TREE_CONTENT_treeContent[]>) => {
            state.path = action.payload;
        }
    }
});

export const {setNavigationActiveTree, setNavigationPath} = navigationSlice.actions;

export default navigationSlice.reducer;
