import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type TREE_NODE_CHILDREN_treeNodeChildren_list} from '../_gqlTypes/TREE_NODE_CHILDREN';
import {type INavigationState} from './stateType';

export const navigationInitialState: INavigationState = {
    activeTree: '',
    path: [],
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
        setNavigationPath: (state, action: PayloadAction<TREE_NODE_CHILDREN_treeNodeChildren_list[]>) => {
            state.path = action.payload;
        },
    },
});

export const {setNavigationActiveTree, setNavigationPath} = navigationSlice.actions;

export default navigationSlice.reducer;
