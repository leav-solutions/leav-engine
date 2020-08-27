import React from 'react';
import {
    LibraryItemListInitialState,
    LibraryItemListReducerAction,
    LibraryItemListState
} from './../components/LibraryItemsList/LibraryItemsListReducer';

export const StateItemsContext = React.createContext<{
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}>({stateItems: LibraryItemListInitialState, dispatchItems: null as any});

export const useStateItem = () => React.useContext(StateItemsContext);
