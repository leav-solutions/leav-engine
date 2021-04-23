// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockFilter} from '__mocks__/common/filter';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {MockStateFilters} from '__mocks__/stateFilters/mockStateFilters';
import FilterCondition from './FilterCondition';

describe('FilterCondition', () => {
    test('should contain select for condition', async () => {
        const stateMock = {attributes: {attributes: [mockAttribute]}};

        render(
            <MockStore state={stateMock}>
                <MockStateFilters stateFilters={{filters: [mockFilter]}}>
                    <FilterCondition filter={mockFilter} updateFilterValue={jest.fn()} />
                </MockStateFilters>
            </MockStore>
        );
        const selectElement = screen.getByTestId('filter-condition-select');

        expect(selectElement).toBeInTheDocument();
    });
});
