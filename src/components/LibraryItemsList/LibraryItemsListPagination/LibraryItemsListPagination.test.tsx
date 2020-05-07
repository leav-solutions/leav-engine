import React from 'react';
import {render} from 'enzyme';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
    test('Snapshot test', async () => {
        const comp = render(<LibraryItemsListPagination />);

        expect(comp).toMatchSnapshot();
    });
});
