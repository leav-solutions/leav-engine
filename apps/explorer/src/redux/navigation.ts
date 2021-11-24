// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {INavigationState} from './stateType';

export const navigationInitialState: INavigationState = {
    activeTree: '',
    path: [],
    isLoading: true,
    refetchTreeData: false
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
        setNavigationPath: (state, action: PayloadAction<RecordIdentity_whoAmI[]>) => {
            state.path = action.payload;
        },
        setNavigationIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNavigationRecordDetail: (state, action: PayloadAction<RecordIdentity>) => {
            state.recordDetail = action.payload;
        },
        resetNavigationRecordDetail: state => {
            state.recordDetail = undefined;
        },
        setNavigationRefetchTreeData: (state, action: PayloadAction<boolean>) => {
            state.refetchTreeData = action.payload;
            state.isLoading = action.payload;
        }
    }
});

export const {
    setNavigationActiveTree,
    setNavigationPath,
    setNavigationIsLoading,
    setNavigationRecordDetail,
    resetNavigationRecordDetail,
    setNavigationRefetchTreeData
} = navigationSlice.actions;

export default navigationSlice.reducer;
