// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../../__mocks__/stateItems/mockStateItems';
import RecordPreview from '../../LibraryItemsListTable/RecordPreview';
import ItemTileDisplay from './ItemTileDisplay';

describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        fields: {},
        whoAmI: {
            id: 'test'
        },
        index: 0
    };

    test('should call RecordPreview', async () => {
        const comp = mount(
            <MockedProviderWithFragments>
                <MockStateItems>
                    <ItemTileDisplay item={itemMock} showRecordEdition={jest.fn()} />
                </MockStateItems>
            </MockedProviderWithFragments>
        );

        expect(comp.find(RecordPreview)).toHaveLength(1);
    });
});
