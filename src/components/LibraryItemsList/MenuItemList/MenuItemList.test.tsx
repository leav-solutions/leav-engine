import {Button} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import MenuItemList from './MenuItemList';

jest.mock('../LibraryItemsListMenuPagination', () => {
    return function LibraryItemsListMenuPagination() {
        return <div>LibraryItemsListMenuPagination</div>;
    };
});

describe('MenuItemList', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have button show filter', async () => {
        const comp = mount(
            <MenuItemList
                stateItems={{...stateItems, showFilters: false}}
                dispatchItems={dispatchItems}
                refetch={jest.fn()}
            />
        );

        expect(comp.find(Button).first().prop('name')).toBe('show-filter');
    });

    test("shouldn't have button show filter", async () => {
        const comp = mount(
            <MenuItemList
                stateItems={{...stateItems, showFilters: false}}
                dispatchItems={dispatchItems}
                refetch={jest.fn()}
            />
        );

        expect(comp.find(Button).first().prop('name')).toBe('show-filter');
    });
});
