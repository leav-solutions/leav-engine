import React from 'react';
import {render} from 'enzyme';
import MenuItemListSelected from './MenuItemListSelected';

describe('MenuItemListSelected', () => {
    test('Snapshot test', async () => {
        const comp = render(<MenuItemListSelected />);

        expect(comp).toMatchSnapshot();
    });
});
