// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Snapshot test', async () => {
        const comp = shallow(<TextBlock settings={{content: 'test_content'}} />);

        expect(comp.text()).toBe('test_content');
    });
});
