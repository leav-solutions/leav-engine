import React from 'react';
import {render} from 'enzyme';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';

describe('LibraryItemsListMenuPagination', () => {
    test('Snapshot test', async () => {
        const comp = render(<LibraryItemsListMenuPagination />);

        expect(comp).toMatchSnapshot();
    });
});
