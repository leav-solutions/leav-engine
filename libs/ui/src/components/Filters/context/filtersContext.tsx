import {createContext, type Dispatch} from 'react';
import {type UIFiltersAction, type IUIFiltersState} from './filtersReducer';

export const FiltersContext = createContext<{
    filtersData: IUIFiltersState;
    dispatch: Dispatch<UIFiltersAction>;
}>({
    filtersData: null as IUIFiltersState,
    dispatch: () => null,
});
