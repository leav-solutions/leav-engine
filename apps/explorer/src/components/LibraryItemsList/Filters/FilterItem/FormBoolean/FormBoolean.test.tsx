// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../_types/types';
import FormBoolean from './FormBoolean';

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });
});

describe('FormBoolean', () => {
    test('should checkbox', async () => {
        const mockFilter: IFilter = {
            id: 'test_filter',
            type: FilterTypes.filter,
            key: 0,
            condition: ConditionFilter.contains,
            value: 'test',
            attributeId: 'test',
            active: true
        };
        const comp = mount(<FormBoolean filter={mockFilter} updateFilterValue={jest.fn()} />);

        expect(comp.find('Radio')).toHaveLength(2);
    });
});
