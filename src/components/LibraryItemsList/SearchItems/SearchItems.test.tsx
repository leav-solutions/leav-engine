import {render} from 'enzyme';
import React from 'react';
import {LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(<SearchItems dispatchItems={dispatchItems} />);

        expect(comp).toMatchSnapshot();
    });
});
