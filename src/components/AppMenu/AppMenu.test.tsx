import {shallow} from 'enzyme';
import * as React from 'react';
import AppMenu from './AppMenu';

describe('AppMenu', () => {
    const menuElems = [{id: 'test', label: 'Test'}, {id: 'test2', label: 'Test 2'}];
    const activeItem = 'test';
    const onItemClick = jest.fn();

    const comp = shallow(<AppMenu activeItem={activeItem} items={menuElems} onItemClick={onItemClick} />);
    test('Render menu', async () => {
        expect(comp.find('.menu_item').length).toBe(2);
    });

    test('Run onclick function', async () => {
        comp.find('.menu_item')
            .first()
            .simulate('click');
        expect(onItemClick.mock.calls.length).toBe(1);
    });
});
