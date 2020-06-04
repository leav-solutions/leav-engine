import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListTable from './LibraryItemsListTable';

describe('LibraryItemsListTable', () => {
    test('Snapshot test', async () => {
        const setItems = jest.fn();
        const totalCount = 0;
        const pagination = 20;
        const offset = 0;
        const setOffset = jest.fn();
        const modeSelection = false;
        const setModeSelection = jest.fn();
        const selected = {};
        const setSelected = jest.fn();

        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsListTable
                    setItems={setItems}
                    totalCount={totalCount}
                    pagination={pagination}
                    offset={offset}
                    setOffset={setOffset}
                    modeSelection={modeSelection}
                    setModeSelection={setModeSelection}
                    selected={selected}
                    setSelected={setSelected}
                />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
