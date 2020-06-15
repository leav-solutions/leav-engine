import React from 'react';
import {render} from 'enzyme';
import MenuItemList from './MenuItemList';

describe('MenuItemList', () => {
    test('Snapshot test', async () => {
        const comp = render(<MenuItemList />);

        expect(comp).toMatchSnapshot();
    });
});
