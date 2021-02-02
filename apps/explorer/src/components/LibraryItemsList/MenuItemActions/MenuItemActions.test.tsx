// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MenuItemActions from './MenuItemActions';

describe('MenuItemActions', () => {
    test('should get a button', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<MenuItemActions />);
        });

        expect(comp.find('Button')).toHaveLength(1);
    });

    test('should get choose-columns', async () => {
        let comp: any;
        let menu: any;

        await act(async () => {
            comp = shallow(<MenuItemActions />);
            menu = shallow(comp.find('Dropdown').first().props().overlay);
        });

        expect(menu.html()).toContain('items_list.table.header-cell-menu.choose-columns');
    });

    test('should get sort-advance', async () => {
        let comp: any;
        let menu: any;

        await act(async () => {
            comp = shallow(<MenuItemActions />);
            menu = shallow(comp.find('Dropdown').first().props().overlay);
        });

        expect(menu.html()).toContain('items_list.table.header-cell-menu.sort-advance');
    });

    test('should get regroup', async () => {
        let comp: any;
        let menu: any;

        await act(async () => {
            comp = shallow(<MenuItemActions />);
            menu = shallow(comp.find('Dropdown').first().props().overlay);
        });

        expect(menu.html()).toContain('items_list.table.header-cell-menu.regroup');
    });
});
