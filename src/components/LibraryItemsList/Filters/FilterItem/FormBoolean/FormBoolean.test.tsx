import {mount} from 'enzyme';
import React from 'react';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../_types/types';
import FormBoolean from './FormBoolean';

describe('FormBoolean', () => {
    test('Snapshot test', async () => {
        const mockFilter: IFilter = {
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attributeId: 'test',
            active: true
        };
        const comp = mount(<FormBoolean filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find('Checkbox')).toHaveLength(2);
    });
});
