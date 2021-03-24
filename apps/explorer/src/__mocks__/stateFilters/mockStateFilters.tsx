// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFiltersReducerState} from 'hooks/FiltersStateHook/FiltersStateReducer';
import {FilterStateContext} from 'hooks/FiltersStateHook/FilterStateContext';
import React from 'react';
import {filterReducerInitialState} from '../../hooks/FiltersStateHook/FilterReducerInitialState';

interface IMockStateFiltersProps {
    children: React.ReactNode;
    stateFilters?: Partial<IFiltersReducerState>;
    dispatchFilters?: any;
}

export const MockStateFilters = ({children, stateFilters, dispatchFilters}: IMockStateFiltersProps) => {
    let stateFiltersValue: IFiltersReducerState = filterReducerInitialState;
    let dispatchFiltersValue = jest.fn();

    if (stateFilters) {
        stateFiltersValue = {...stateFiltersValue.filters, ...stateFilters} as any;
    }

    if (dispatchFilters) {
        dispatchFiltersValue = dispatchFilters;
    }

    return (
        <FilterStateContext.Provider value={{stateFilters: stateFiltersValue, dispatchFilters: dispatchFiltersValue}}>
            {children}
        </FilterStateContext.Provider>
    );
};
