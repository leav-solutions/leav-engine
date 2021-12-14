// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockFilterAttribute} from '__mocks__/common/filter';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import FilterAttributeCondition from './FilterAttributeCondition';

describe('FilterAttributeCondition', () => {
    test('should contain select for condition', async () => {
        render(
            <MockSearchContextProvider
                state={{
                    attributes: [mockAttribute],
                    library: {...mockGetLibraryDetailExtendedElement, id: 'testLibrary'}
                }}
            >
                <FilterAttributeCondition filter={mockFilterAttribute} updateFilterValue={jest.fn()} />
            </MockSearchContextProvider>
        );

        const selectElement = screen.getByTestId('filter-condition-dropdown');

        expect(selectElement).toBeInTheDocument();
    });
});
