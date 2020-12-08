import {mount} from 'enzyme';
import React from 'react';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import MenuItemListSelected from './MenuItemListSelected';

describe('MenuItemListSelected', () => {
    test('should have quit mode selection button', async () => {
        const comp = mount(
            <MockStateItems>
                <MenuItemListSelected active={true} />
            </MockStateItems>
        );

        expect(comp.text()).toContain('menu-selection.quit');
    });
});
