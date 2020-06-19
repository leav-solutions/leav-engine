import {render} from 'enzyme';
import React from 'react';
import {FilterTypes, operatorFilter} from '../../../../../_types/types';
import FilterSeparator from './FilterSeparator';

describe('FilterSeparator', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <FilterSeparator
                separator={{
                    type: FilterTypes.separator,
                    key: 0,
                    active: true
                }}
                operatorOptions={[]}
                setFilters={jest.fn()}
                separatorOperator={operatorFilter.and}
                setSeparatorOperator={jest.fn()}
                updateFilters={jest.fn()}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
