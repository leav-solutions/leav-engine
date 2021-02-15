// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {FilterTypes, OperatorFilter} from '../../../../_types/types';
import FilterSeparator from './FilterSeparator';

describe('FilterSeparator', () => {
    test('have a the operator selector', async () => {
        render(
            <FilterSeparator
                separator={{
                    id: 'test_separator',
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

        const operatorSelectorElement = screen.getByTestId('operator-selector');

        expect(operatorSelectorElement).toBeInTheDocument();
    });
});
