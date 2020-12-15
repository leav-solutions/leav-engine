import React from 'react';
import {mount} from 'enzyme';
import SideItems from './SideItems';
import {act} from 'react-dom/test-utils';

describe('SideItems', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<SideItems />);
        });

        expect(comp);
    });
});
