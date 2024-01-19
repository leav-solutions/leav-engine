// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockFilterTree} from '_ui/__mocks__/common/filter';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import FilterTreeCondition from './FilterTreeCondition';

describe('FilterTreeCondition', () => {
    test('should contain select for condition', async () => {
        render(
            <MockSearchContextProvider
                state={{attributes: [{...mockAttributeSimple, isLink: false, isMultiple: false, library: 'test'}]}}
            >
                <FilterTreeCondition filter={mockFilterTree} />
            </MockSearchContextProvider>
        );
        const selectElement = screen.getByTestId('filter-condition-dropdown');

        expect(selectElement).toBeInTheDocument();
    });
});
