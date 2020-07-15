import {mount} from 'enzyme';
import React from 'react';
import {LibraryItemListReducerAction, initialState} from '../LibraryItemsListReducer';
import MenuItemListSelected from './MenuItemListSelected';

describe('MenuItemListSelected', () => {
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have quit mode selection button', async () => {
        const comp = mount(<MenuItemListSelected stateItems={initialState} dispatchItems={dispatchItems} />);

        expect(comp.find('button').text()).toContain('menu-selection.quit');
    });
});
