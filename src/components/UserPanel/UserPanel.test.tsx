import {mount} from 'enzyme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import UserPanel from './UserPanel';

describe('UserPanel', () => {
    test('should be a sidebar', async () => {
        const comp = mount(
            <BrowserRouter>
                <UserPanel userPanelVisible={true} hideUserPanel={jest.fn()} />
            </BrowserRouter>
        );

        expect(comp.find('Drawer')).toHaveLength(1);
    });
});
