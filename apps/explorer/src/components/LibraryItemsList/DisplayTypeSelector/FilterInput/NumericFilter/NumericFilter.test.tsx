// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockFilterAttribute} from '__mocks__/common/filter';
import NumericFilter from './NumericFilter';

describe('NumericFilter', () => {
    test('Should have a number input', async () => {
        const comp = shallow(<NumericFilter filter={mockFilterAttribute} updateFilterValue={jest.fn()} />);

        expect(comp.find('Input[type="number"]')).toHaveLength(1);
    });
});
