import {mount} from 'enzyme';
import React from 'react';
import UserPanel from './UserPanel';

describe('UserPanel', () => {
    test('should be a sidebar', async () => {
        const comp = mount(<UserPanel userPanelVisible={true} hideUserPanel={jest.fn()} />);

        expect(comp.find('Sidebar')).toHaveLength(1);
    });
});
