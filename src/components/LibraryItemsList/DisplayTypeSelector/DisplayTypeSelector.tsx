import React from 'react';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListTable from '../LibraryItemsListTable';
import TileDisplay from '../TileDisplay';

interface IDisplayTypeSelectorProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function DisplayTypeSelector({stateItems, dispatchItems}: IDisplayTypeSelectorProps): JSX.Element {
    switch (stateItems.displayType) {
        case DisplayListItemTypes.tile:
            return <TileDisplay stateItems={stateItems} dispatchItems={dispatchItems} />;
        case DisplayListItemTypes.listSmall:
        case DisplayListItemTypes.listMedium:
        case DisplayListItemTypes.listBig:
            return <></>;
            return <LibraryItemsListTable stateItems={stateItems} dispatchItems={dispatchItems} />;
    }
}

export default DisplayTypeSelector;
