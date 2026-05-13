import {type IUIFiltersState} from './filtersReducer';

export const filtersInitialState: IUIFiltersState = {
    libraryId: null,
    viewId: null,
    filtersOperator: 'AND',
    filters: [],
    initialFilters: [],
    attributesDataById: {},
    loading: false,
};
