// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import AppMenu from './AppMenu';

describe('AppMenu', () => {
    const menuElems = [
        {id: 'test', label: 'Test'},
        {id: 'test2', label: 'Test 2'}
    ];

    const comp = shallow(<AppMenu items={menuElems} />);
    test('Render menu', async () => {
        expect(comp.find('.menu_item').length).toBe(2);
    });
});
