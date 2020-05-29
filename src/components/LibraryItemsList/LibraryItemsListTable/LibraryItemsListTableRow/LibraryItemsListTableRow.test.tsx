import {render} from 'enzyme';
import React from 'react';
import MockedLangContextProvider from '../../../../__mocks__/MockedLangContextProvider';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

jest.mock('../../../../hooks/useLang');

jest.mock('@apollo/react-hooks', () => ({
    useMutation: jest.fn(() => [])
}));

describe('LibraryItemsListTableRow', () => {
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };
        const comp = render(
            <MockedLangContextProvider>
                <LibraryItemsListTableRow item={itemMock} modeSelection={false} setModeSelection={jest.fn()} />
            </MockedLangContextProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
