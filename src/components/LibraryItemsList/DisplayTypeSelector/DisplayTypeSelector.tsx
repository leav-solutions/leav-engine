import React from 'react';
import {displayListItemTypes} from '../../../_types/types';
import ItemsTitleDisplay from '../ItemsTitleDisplay';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListTable from '../LibraryItemsListTable';

interface IDisplayTypeSelectorProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function DisplayTypeSelector({stateItems, dispatchItems}: IDisplayTypeSelectorProps): JSX.Element {
    switch (stateItems.displayType) {
        case displayListItemTypes.tile:
            return <ItemsTitleDisplay stateItems={stateItems} dispatchItems={dispatchItems} />;
        case displayListItemTypes.listSmall:
        case displayListItemTypes.listMedium:
        case displayListItemTypes.listBig:
            return <LibraryItemsListTable stateItems={stateItems} dispatchItems={dispatchItems} />;
    }
}

export default DisplayTypeSelector;
