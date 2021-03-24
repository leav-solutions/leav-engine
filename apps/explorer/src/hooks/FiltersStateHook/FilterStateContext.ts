// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {filterReducerInitialState} from './FilterReducerInitialState';
import {FilterReducerActions, IFiltersReducerState} from './FiltersStateReducer';

export const FilterStateContext = React.createContext<{
    stateFilters: IFiltersReducerState;
    dispatchFilters: React.Dispatch<FilterReducerActions>;
}>({stateFilters: filterReducerInitialState, dispatchFilters: null as any});
