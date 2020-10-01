import {shallow} from 'enzyme';
import React from 'react';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Snapshot test', async () => {
        const comp = shallow(<TextBlock settings={{content: 'test_content'}} />);

        expect(comp.text()).toBe('test_content');
    });
});
