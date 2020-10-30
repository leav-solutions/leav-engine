import {Dropdown} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import MenuSelection from './MenuSelection';

describe('MenuSelection', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should display a dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<MenuSelection stateItems={stateItems} dispatchItems={dispatchItems} />);
        });

        expect(comp.find(Dropdown)).toHaveLength(1);
        expect(comp.text()).toContain('items-list-row.nb-elements');
    });
});
