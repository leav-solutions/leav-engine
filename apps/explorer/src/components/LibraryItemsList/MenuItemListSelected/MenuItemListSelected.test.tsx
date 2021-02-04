// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import MenuItemListSelected from './MenuItemListSelected';

describe('MenuItemListSelected', () => {
    test('should have quit mode selection button', async () => {
        const comp = mount(
            <MockStateItems>
                <MenuItemListSelected active />
            </MockStateItems>
        );

        expect(comp.text()).toContain('menu-selection.quit');
    });
});
