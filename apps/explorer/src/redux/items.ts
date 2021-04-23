// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {defaultSort} from 'constants/constants';
import {IItem} from '_types/types';
import {IItemsSort, IItemsState} from './stateType';

export const itemsInitialState: IItemsState = {
    items: [],
    totalCount: 0,
    pagination: 20,
    offset: 0,
    loading: false,
    sort: null
};

const itemsSlice = createSlice({
    name: 'items',
    initialState: itemsInitialState,
    reducers: {
        setItems: (state, action: PayloadAction<IItem[]>) => {
            state.items = action.payload;
        },
        setItemsTotalCount: (state, action: PayloadAction<number>) => {
            state.totalCount = action.payload;
        },
        setItemsPagination: (state, action: PayloadAction<number>) => {
            state.pagination = action.payload;
        },
        setItemsOffset: (state, action: PayloadAction<number>) => {
            state.offset = action.payload;
        },
        setItemsLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setItemsSort: (state, action: PayloadAction<IItemsSort>) => {
            state.sort = action.payload;
        },
        cancelItemsSort: state => {
            state.sort = {...defaultSort, active: false};
        }
    }
});

export const {
    setItems,
    setItemsTotalCount,
    setItemsPagination,
    setItemsOffset,
    setItemsLoading,
    setItemsSort,
    cancelItemsSort
} = itemsSlice.actions;

export default itemsSlice.reducer;
