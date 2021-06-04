// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {itemsInitialState} from 'redux/items';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {
    mockGetLibraryDetailExtendedElement,
    mockGetLibraryDetailExtendedQuery,
    mockGetLibraryDetailExtendedQueryVar
} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {
    mockGetRecordsFromLibraryQuery,
    mockGetRecordsFromLibraryQueryVar
} from '__mocks__/mockQuery/mockGetRecordsFromLibraryQuery';
import LibraryItemsList from '.';
import {getLibraryDetailExtendedQuery} from '../../graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../graphQL/queries/records/getRecordsFromLibraryQuery';
import {AttributeType} from '../../_types/types';

jest.mock('../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, jest.fn()]
}));

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

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

    const stateMock = {items: {...itemsInitialState, mockStateItem}};

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
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStore state={stateMock}>
                        <LibraryItemsList library={mockGetLibraryDetailExtendedElement} />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            expect(screen.getByText('SideItems')).toBeInTheDocument();
            expect(screen.getByText('MenuItemList')).toBeInTheDocument();
            expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
        });
    });

    test('should call the same child', async () => {
        await act(async () => {
            const mocks = [
                {
                    request: {
                        query: getLibraryDetailExtendedQuery,
                        variables: mockGetLibraryDetailExtendedQueryVar
                    },
                    result: {
                        data: mockGetLibraryDetailExtendedQuery
                    }
                },
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
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStore state={stateMock}>
                        <LibraryItemsList library={mockGetLibraryDetailExtendedElement} selectionMode={true} />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            expect(screen.getByText('SideItems')).toBeInTheDocument();
            expect(screen.getByText('MenuItemList')).toBeInTheDocument();
            expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
        });
    });
});
