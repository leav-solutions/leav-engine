// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, type PropsWithChildren} from 'react';
import {FiltersContext} from './context/filtersContext';
import {type IFiltersProviderProps, useFiltersReducer} from './context/useFiltersReducer';

export const FiltersProvider: FunctionComponent<PropsWithChildren<IFiltersProviderProps>> = ({children, ...props}) => {
    const {filtersData, dispatch} = useFiltersReducer(props);

    return <FiltersContext.Provider value={{filtersData, dispatch}}>{children}</FiltersContext.Provider>;
};
