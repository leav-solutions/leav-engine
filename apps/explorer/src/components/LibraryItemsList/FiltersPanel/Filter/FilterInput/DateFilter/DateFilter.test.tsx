// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker} from 'antd';
import {shallow} from 'enzyme';
import React from 'react';
import {mockFilterAttribute} from '__mocks__/common/filter';
import DateFilter from './DateFilter';

describe('DateFilter', () => {
    test('Should have a Date picker', async () => {
        const comp = shallow(<DateFilter filter={mockFilterAttribute} updateFilterValue={jest.fn()} />);

        expect(comp.find(DatePicker)).toHaveLength(1);
    });
});
