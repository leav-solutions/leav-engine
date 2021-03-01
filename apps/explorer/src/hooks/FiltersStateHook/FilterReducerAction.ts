// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFilter, IQueryFilter} from '../../_types/types';
import {FilterReducerActions, FiltersReducerActionTypes} from './FiltersStateReducer';

export const setFilters = (filters: IFilter[]): FilterReducerActions => {
    return {
        type: FiltersReducerActionTypes.SET_FILTERS,
        filters
    };
};

export const setQueryFilters = (queryFilters: IQueryFilter[]): FilterReducerActions => ({
    type: FiltersReducerActionTypes.SET_QUERY_FILTERS,
    queryFilters
});
