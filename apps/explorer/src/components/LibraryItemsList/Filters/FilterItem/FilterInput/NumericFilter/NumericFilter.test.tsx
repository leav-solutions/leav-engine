// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../../_types/types';
import NumericFilter from './NumericFilter';

describe('NumericFilter', () => {
    test('Should have a number input', async () => {
        const mockFilter: IFilter = {
            id: 'test',
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attribute: mockAttributeStandard,
            active: true
        };

        const comp = shallow(<NumericFilter filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find('Input[type="number"]')).toHaveLength(1);
    });
});
