import {render} from 'enzyme';
import React from 'react';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

describe('LibraryItemsListTableRow', () => {
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };
        const comp = render(<LibraryItemsListTableRow item={itemMock} />);

        expect(comp).toMatchSnapshot();
    });
});
