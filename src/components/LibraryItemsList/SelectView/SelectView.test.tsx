import {mount} from 'enzyme';
import React from 'react';
import SelectView from './SelectView';

describe('SelectView', () => {
    test('Snapshot test', async () => {
        const comp = mount(<SelectView />);

        expect(comp.find('Dropdown')).toHaveLength(1);
    });
});
