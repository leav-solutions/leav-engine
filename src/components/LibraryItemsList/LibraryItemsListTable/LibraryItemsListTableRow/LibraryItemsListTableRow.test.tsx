import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

describe('LibraryItemsListTableRow', () => {
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };
        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsListTableRow
                    item={itemMock}
                    modeSelection={false}
                    setModeSelection={jest.fn()}
                    selected={{}}
                    setSelected={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
