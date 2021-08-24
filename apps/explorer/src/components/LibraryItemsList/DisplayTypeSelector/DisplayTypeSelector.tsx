// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {ViewTypes} from '_gqlTypes/globalTypes';
import Table from '../LibraryItemsListTable';
import TileDisplay from '../TileDisplay';
import useSearchReducer from 'hooks/useSearchReducer';

function DisplayTypeSelector(): JSX.Element {
    const {state: searchState} = useSearchReducer();

    switch (searchState.displayType) {
        case ViewTypes.list:
            return <Table />;
        case ViewTypes.timeline:
            return <div>Not supported yet</div>;
        case ViewTypes.cards:
        default:
            return <TileDisplay />;
    }
}

export default DisplayTypeSelector;
