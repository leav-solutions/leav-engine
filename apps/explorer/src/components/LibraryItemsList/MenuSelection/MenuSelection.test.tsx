// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {MockStateItems} from '__mocks__/stateItems/mockStateItems';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import MenuSelection from './MenuSelection';

describe('MenuSelection', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should display a dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateItems>
                    <MenuSelection />
                </MockStateItems>
            );
        });

        expect(comp.find(Dropdown)).toHaveLength(1);
        expect(comp.text()).toContain('items-list-row.nb-elements');
    });
});
