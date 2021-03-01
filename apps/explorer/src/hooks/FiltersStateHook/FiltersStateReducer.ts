// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFilter, IQueryFilter} from '../../_types/types';

export enum FiltersReducerActionTypes {
    SET_FILTERS = 'SET_FILTERS',
    SET_QUERY_FILTERS = 'SET_QUERY_FILTERS'
}

export interface IFiltersReducerState {
    filters: IFilter[];
    queryFilters: IQueryFilter[];
}

export type FilterReducerActions =
    | {
          type: FiltersReducerActionTypes.SET_FILTERS;
          filters: IFilter[];
      }
    | {
          type: FiltersReducerActionTypes.SET_QUERY_FILTERS;
          queryFilters: IQueryFilter[];
      };

export const filterStateReducer = (state: IFiltersReducerState, action: FilterReducerActions): IFiltersReducerState => {
    switch (action.type) {
        case FiltersReducerActionTypes.SET_FILTERS:
            return {...state, filters: action.filters};
        case FiltersReducerActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        default:
            return state;
    }
};
