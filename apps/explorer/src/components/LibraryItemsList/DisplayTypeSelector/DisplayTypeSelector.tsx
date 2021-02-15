// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useStateItem} from '../../../Context/StateItemsContext';
import {ViewType} from '../../../_types/types';
import Table from '../LibraryItemsListTable';
import TileDisplay from '../TileDisplay';

function DisplayTypeSelector(): JSX.Element {
    const {
        stateItems: {view}
    } = useStateItem();

    switch (view.current?.type) {
        case ViewType.list:
            return <Table />;
        case ViewType.timeline:
            return <div>Not supported yet</div>;
        case ViewType.cards:
        default:
            return <TileDisplay />;
    }
}

export default DisplayTypeSelector;
