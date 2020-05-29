import {render} from 'enzyme';
import React from 'react';
import MockedLangContextProvider from '../../../../__mocks__/MockedLangContextProvider';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

jest.mock('../../../../hooks/useLang');

describe('LibraryItemsListTableRow', () => {
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };
        const comp = render(
            <MockedProviderWithFragments>
                <MockedLangContextProvider>
                    <LibraryItemsListTableRow item={itemMock} modeSelection={false} setModeSelection={jest.fn()} />
                </MockedLangContextProvider>
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
