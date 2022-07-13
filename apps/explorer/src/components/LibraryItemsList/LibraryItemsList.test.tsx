// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {AttributeType} from '_gqlTypes/globalTypes';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {
    mockGetRecordsFromLibraryQuery,
    mockGetRecordsFromLibraryQueryVar
} from '__mocks__/mockQuery/mockGetRecordsFromLibraryQuery';
import {getRecordsFromLibraryQuery} from '../../graphQL/queries/records/getRecordsFromLibraryQuery';
import LibraryItemsList from './LibraryItemsList';

jest.mock('../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, jest.fn()]
}));

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock('../../hooks/LangHook/LangHook');

jest.mock(
    './SideItems',
    () =>
        function SideItems() {
            return <div>SideItems</div>;
        }
);
jest.mock(
    './MenuItemList',
    () =>
        function MenuItemList() {
            return <div>MenuItemList</div>;
        }
);
jest.mock(
    './MenuItemListSelected',
    () =>
        function MenuItemListSelected() {
            return <div>MenuItemListSelected</div>;
        }
);
jest.mock(
    './DisplayTypeSelector',
    () =>
        function DisplayTypeSelector() {
            return <div>DisplayTypeSelector</div>;
        }
);

describe('LibraryItemsList', () => {
    const libQueryName = 'test';

    const mockStateItem = {
        pagination: 20,
        offset: 0,
        field: [
            {
                id: 'testId',
                label: 'Test',
                library: 'testLib',
                type: AttributeType.simple,
                key: 'testId_testLib'
            }
        ]
    };

    test('should call the child', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordsFromLibraryQuery(libQueryName, [], true),
                    variables: mockGetRecordsFromLibraryQueryVar
                },
                result: {
                    data: mockGetRecordsFromLibraryQuery(libQueryName, mockStateItem.field)
                }
            }
        ];

        await act(async () => {
            render(<LibraryItemsList library={mockGetLibraryDetailExtendedElement} selectionMode={true} />, {
                apolloMocks: mocks
            });
        });

        await waitFor(() => screen.getByText('DisplayTypeSelector'));

        expect(screen.getByText('SideItems')).toBeInTheDocument();
        expect(screen.getByText('MenuItemList')).toBeInTheDocument();
        expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
    });
});
