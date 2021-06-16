// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen, waitForElement} from '_tests/testUtils';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {
    mockGetRecordsFromLibraryQuery,
    mockGetRecordsFromLibraryQueryVar
} from '__mocks__/mockQuery/mockGetRecordsFromLibraryQuery';
import LibraryItemsList from '.';
import {getRecordsFromLibraryQuery} from '../../graphQL/queries/records/getRecordsFromLibraryQuery';
import {AttributeType} from '../../_types/types';

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

    test('should call Child', async () => {
        await act(async () => {
            const mocks = [
                {
                    request: {
                        query: getRecordsFromLibraryQuery(libQueryName, mockStateItem.field),
                        variables: mockGetRecordsFromLibraryQueryVar
                    },
                    result: {
                        data: mockGetRecordsFromLibraryQuery(libQueryName, mockStateItem.field)
                    }
                }
            ];
            render(<LibraryItemsList library={mockGetLibraryDetailExtendedElement} />, {apolloMocks: mocks});

            expect(screen.getByText('SideItems')).toBeInTheDocument();
            expect(screen.getByText('MenuItemList')).toBeInTheDocument();
            expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
        });
    });

    test('should call the same child', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordsFromLibraryQuery(libQueryName, []),
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

        await waitForElement(() => screen.getByText('DisplayTypeSelector'));

        expect(screen.getByText('SideItems')).toBeInTheDocument();
        expect(screen.getByText('MenuItemList')).toBeInTheDocument();
        expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
    });
});
