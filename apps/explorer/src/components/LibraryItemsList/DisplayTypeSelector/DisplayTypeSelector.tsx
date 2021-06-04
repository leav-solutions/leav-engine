// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useAppSelector} from 'redux/store';
import {ViewTypes} from '_gqlTypes/globalTypes';
import Table from '../LibraryItemsListTable';
import TileDisplay from '../TileDisplay';

function DisplayTypeSelector(): JSX.Element {
    const view = useAppSelector(state => state.view);

    switch (view.current?.type) {
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
