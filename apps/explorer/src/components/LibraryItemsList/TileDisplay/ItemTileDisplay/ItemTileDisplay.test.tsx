// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IItem} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../../__mocks__/stateItems/mockStateItems';
import ItemTileDisplay from './ItemTileDisplay';
jest.mock(
    '../../LibraryItemsListTable/RecordPreview',
    () =>
        function RecordPreview() {
            return <div>RecordPreview</div>;
        }
);
describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        fields: {},
        whoAmI: {
            id: 'test'
        },
        index: 0
    };

    test('should call RecordPreview', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <ItemTileDisplay item={itemMock} showRecordEdition={jest.fn()} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText('RecordPreview')).toBeInTheDocument();
    });
});
