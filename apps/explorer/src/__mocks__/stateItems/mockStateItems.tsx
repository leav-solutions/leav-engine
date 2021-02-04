// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {ReactNode} from 'react';
import {
    ILibraryItemListState,
    LibraryItemListInitialState
} from '../../components/LibraryItemsList/LibraryItemsListReducer';
import {StateItemsContext} from '../../Context/StateItemsContext';

interface IMockStateItems {
    children: ReactNode;
    stateItems?: Partial<ILibraryItemListState>;
    dispatchItems?: any;
}

export const MockStateItems = ({children, stateItems, dispatchItems}: IMockStateItems) => {
    let stateItemsValue: ILibraryItemListState = LibraryItemListInitialState;
    let dispatchItemsValue = jest.fn();

    if (stateItems) {
        stateItemsValue = {...stateItemsValue, ...stateItems};
    }
    if (dispatchItems) {
        dispatchItemsValue = dispatchItems;
    }

    return (
        <StateItemsContext.Provider value={{stateItems: stateItemsValue, dispatchItems: dispatchItemsValue}}>
            {children}
        </StateItemsContext.Provider>
    );
};
