// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
