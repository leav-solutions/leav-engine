// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {shallow} from 'enzyme';
import React from 'react';
import {ConditionFilter, FilterTypes, IFilter} from '_types/types';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import TextFilter from '../FilterInput/TextFilter';

describe('FormText', () => {
    test('Should have a TextArea', async () => {
        const mockFilter: IFilter = {
            id: 'test',
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attribute: mockAttributeStandard,
            active: true
        };

        const comp = shallow(<TextFilter filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find(Input.TextArea)).toHaveLength(1);
    });
});
