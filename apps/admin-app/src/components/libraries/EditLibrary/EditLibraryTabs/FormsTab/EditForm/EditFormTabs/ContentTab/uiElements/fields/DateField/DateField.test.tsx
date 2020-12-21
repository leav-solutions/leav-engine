// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import DateField from './DateField';

describe('DateField', () => {
    test('Display date field', async () => {
        const comp = shallow(<DateField settings={{}} />);

        expect(comp.find('[data-test-id="date-field"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="time-field"]')).toHaveLength(0);
    });

    test('If withTime is true, display date and time field', async () => {
        const comp = shallow(<DateField settings={{withTime: true}} />);

        expect(comp.find('[data-test-id="date-field"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="time-field"]')).toHaveLength(1);
    });
});
