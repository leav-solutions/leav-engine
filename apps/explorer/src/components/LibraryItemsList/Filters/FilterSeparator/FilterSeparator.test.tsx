// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {FilterTypes, OperatorFilter} from '../../../../_types/types';
import FilterSeparator from './FilterSeparator';

describe('FilterSeparator', () => {
    test('have a Dropdown', async () => {
        const comp = mount(
            <FilterSeparator
                separator={{
                    type: FilterTypes.separator,
                    key: 0,
                    active: true
                }}
                operatorOptions={[]}
                setFilters={jest.fn()}
                separatorOperator={OperatorFilter.and}
                setSeparatorOperator={jest.fn()}
                updateFilters={jest.fn()}
            />
        );

        expect(comp.find('Select')).toHaveLength(2);
    });
});
