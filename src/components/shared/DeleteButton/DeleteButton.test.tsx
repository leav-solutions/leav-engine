import {shallow} from 'enzyme';
import React from 'react';
import DeleteButton from './DeleteButton';

describe('DeleteButton', () => {
    test('Snapshot test', async () => {
        const comp = shallow(<DeleteButton disabled={false} />);

        expect(comp.find('Button')).toHaveLength(1);
    });

    test('Disable button', async () => {
        const comp = shallow(<DeleteButton disabled />);

        expect(comp.find('Button').props().disabled).toBe(true);
    });
});
