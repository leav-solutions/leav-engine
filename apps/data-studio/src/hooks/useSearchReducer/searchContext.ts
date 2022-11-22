// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {initialSearchState, SearchAction} from './searchReducer';
import {ISearchState} from './_types';

export const SearchContext = React.createContext<{
    state: ISearchState;
    dispatch: React.Dispatch<SearchAction>;
}>({state: initialSearchState, dispatch: null});
