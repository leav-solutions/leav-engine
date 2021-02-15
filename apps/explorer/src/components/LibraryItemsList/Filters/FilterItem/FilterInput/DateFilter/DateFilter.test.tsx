// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker} from 'antd';
import {shallow} from 'enzyme';
import React from 'react';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../../_types/types';
import DateFilter from './DateFilter';

describe('DateFilter', () => {
    test('Should have a Date picker', async () => {
        const mockFilter: IFilter = {
            id: 'test',
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attribute: mockAttributeStandard,
            active: true
        };

        const comp = shallow(<DateFilter filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find(DatePicker)).toHaveLength(1);
    });
});
