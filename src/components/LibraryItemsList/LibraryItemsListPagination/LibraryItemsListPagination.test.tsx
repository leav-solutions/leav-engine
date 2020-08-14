import {Menu} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
    const stateItems = {...LibraryItemListInitialState, pagination: 5, offset: 0, itemsTotalCount: 15};

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have 3 pagination option', async () => {
        const comp = mount(<LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />);

        expect(comp.find('InputValue')).toHaveLength(1);
        expect(comp.find(Menu.Item)).toHaveLength(
            3 + // pagination option
            2 + // left arrow
                2 // right arrow
        );
    });
});
