// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import TileDisplay from '../TileDisplay';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../TileDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);

describe('DisplayTypeSelector', () => {
    test('Should call ItemsTitleDisplay', async () => {
        const comp = mount(
            <MockStore>
                <DisplayTypeSelector />
            </MockStore>
        );

        expect(comp.find(TileDisplay)).toHaveLength(1);
    });
});
