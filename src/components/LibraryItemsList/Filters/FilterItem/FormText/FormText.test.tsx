import {mount} from 'enzyme';
import React from 'react';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../_types/types';
import FormText from './FormText';

describe('FormText', () => {
    test('Should have a TextArea', async () => {
        const mockFilter: IFilter = {
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attributeId: 'test',
            active: true
        };

        const comp = mount(<FormText filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find('TextArea')).toHaveLength(1);
    });
});
