// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import UserPanel from './UserPanel';

describe('UserPanel', () => {
    test('should be a sidebar', async () => {
        const comp = mount(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
            </BrowserRouter>
        );

        expect(comp.find('Drawer')).toHaveLength(1);
    });
});
