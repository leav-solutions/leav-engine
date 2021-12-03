// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockFilterTree} from '__mocks__/common/filter';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import FilterTreeCondition from './FilterTreeCondition';

describe('FilterTreeCondition', () => {
    test('should contain select for condition', async () => {
        render(
            <MockSearchContextProvider state={{attributes: [{...mockAttribute, library: 'test'}]}}>
                {/* <MockStateFilters stateFilters={{filters: [mockFilter]}}> */}
                <FilterTreeCondition filter={mockFilterTree} />
                {/* </MockStateFilters> */}
            </MockSearchContextProvider>
        );
        const selectElement = screen.getByTestId('filter-condition-select');

        expect(selectElement).toBeInTheDocument();
    });
});
