import {mount} from 'enzyme';
import React from 'react';
import {LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should use dispatchItems when form submit', async () => {
        const comp = mount(<SearchItems dispatchItems={dispatchItems} />);

        expect(comp.find('form')).toHaveLength(1);
        comp.find('form').simulate('submit');

        expect(dispatchItems).toBeCalled();
    });
});
