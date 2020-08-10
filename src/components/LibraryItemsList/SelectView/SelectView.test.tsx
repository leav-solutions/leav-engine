import {mount} from 'enzyme';
import React from 'react';
import SelectView from './SelectView';

describe('SelectView', () => {
    test('should have Dropdown', async () => {
        const comp = mount(<SelectView />);

        expect(comp.find('Dropdown')).toHaveLength(1);
    });
});
