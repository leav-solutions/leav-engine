import {type FunctionComponent, type PropsWithChildren} from 'react';
import {FiltersContext} from './context/filtersContext';
import {type IFiltersProviderProps, useFiltersReducer} from './context/useFiltersReducer';

export const FiltersProvider: FunctionComponent<PropsWithChildren<IFiltersProviderProps>> = ({children, ...props}) => {
    const {filtersData, dispatch} = useFiltersReducer(props);

    return <FiltersContext.Provider value={{filtersData, dispatch}}>{children}</FiltersContext.Provider>;
};
