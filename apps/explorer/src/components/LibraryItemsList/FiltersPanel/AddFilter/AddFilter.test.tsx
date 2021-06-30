// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import AddFilter from './AddFilter';
import userEvent from '@testing-library/user-event';

jest.mock(
    '../../../AttributesSelectionList',
    () =>
        function AttributesSelectionList() {
            return <div>AttributesSelectionList</div>;
        }
);

jest.mock(
    '../../../TreesSelectionList',
    () =>
        function TreesSelectionList() {
            return <div>TreesSelectionList</div>;
        }
);

describe('Lists', () => {
    test('should have a List', async () => {
        render(
            <MockSearchContextProvider>
                <AddFilter showAttr setShowAttr={jest.fn()} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();

        userEvent.click(screen.getByRole('tab', {name: 'filters.trees'}));

        expect(screen.getByText('TreesSelectionList')).toBeInTheDocument();
    });
});
