// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import SelectView from './SelectView';

describe('SelectView', () => {
    test('should have Dropdown', async () => {
        const comp = mount(<SelectView />);

        expect(comp.find('Dropdown')).toHaveLength(1);
    });
});
