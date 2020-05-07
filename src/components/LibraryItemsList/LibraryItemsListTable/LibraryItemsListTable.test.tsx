import React from 'react';
import {render} from 'enzyme';
import LibraryItemsListTable from './LibraryItemsListTable';

describe('LibraryItemsListTable', () => {
    test('Snapshot test', async () => {
        const comp = render(<LibraryItemsListTable />);

        expect(comp).toMatchSnapshot();
    });
});
