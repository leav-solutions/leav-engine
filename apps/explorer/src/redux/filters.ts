// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IQueryFilter} from '_types/types';
import {IFiltersState} from './stateType';

export const filtersInitialState: IFiltersState = {
    queryFilters: [],
    searchFullTextActive: false
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState: filtersInitialState,
    reducers: {
        setFiltersQueryFilters: (state, action: PayloadAction<IQueryFilter[]>) => {
            state.queryFilters = action.payload;
        },
        setFiltersSearchFullTextActive: (state, action: PayloadAction<boolean>) => {
            state.searchFullTextActive = action.payload;
        }
    }
});

export const {setFiltersQueryFilters, setFiltersSearchFullTextActive} = filtersSlice.actions;

export default filtersSlice.reducer;
