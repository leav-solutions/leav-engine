// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockFilter} from '__mocks__/common/filter';
import {MockStateFilters} from '__mocks__/stateFilters/mockStateFilters';
import {MockStateItems} from '__mocks__/stateItems/mockStateItems';
import FilterCondition from './FilterCondition';

describe('FilterCondition', () => {
    test('should contain select for condition', async () => {
        render(
            <MockStateItems stateItems={{attributes: [mockAttribute]}}>
                <MockStateFilters stateFilters={{filters: [mockFilter]}}>
                    <FilterCondition filter={mockFilter} updateFilterValue={jest.fn()} />
                </MockStateFilters>
            </MockStateItems>
        );
        const selectElement = screen.getByTestId('filter-condition-select');

        expect(selectElement).toBeInTheDocument();
    });
});
