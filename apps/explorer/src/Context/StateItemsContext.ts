// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {
    ILibraryItemListState,
    LibraryItemListInitialState,
    LibraryItemListReducerAction
} from './../components/LibraryItemsList/LibraryItemsListReducer';

export const StateItemsContext = React.createContext<{
    stateItems: ILibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}>({stateItems: LibraryItemListInitialState, dispatchItems: null as any});

export const useStateItem = () => React.useContext(StateItemsContext);
