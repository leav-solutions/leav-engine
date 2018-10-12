import {shallow} from 'enzyme';
import * as React from 'react';
import AppMenu from './AppMenu';

describe('AppMenu', () => {
    const menuElems = [{id: 'test', label: 'Test'}, {id: 'test2', label: 'Test 2'}];

    const comp = shallow(<AppMenu items={menuElems} />);
    test('Render menu', async () => {
        expect(comp.find('.menu_item').length).toBe(2);
    });
});
