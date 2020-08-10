import {shallow} from 'enzyme';
import React from 'react';
import {Menu} from 'semantic-ui-react';
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
        const comp = shallow(
            <MenuItemList
                stateItems={{...stateItems, showFilters: false}}
                dispatchItems={dispatchItems}
                refetch={jest.fn()}
            />
        );

        expect(comp.find(Menu.Item)).toHaveLength(6);
    });

    test("shouldn't have button show filter", async () => {
        const comp = shallow(
            <MenuItemList
                stateItems={{...stateItems, showFilters: true}}
                dispatchItems={dispatchItems}
                refetch={jest.fn()}
            />
        );

        expect(comp.find(Menu.Item)).toHaveLength(4);
    });
});
