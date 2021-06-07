// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {RootState} from 'redux/store';
import {NotificationType} from '_types/types';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {
    mockGetLibraryDetailExtendedQuery,
    mockGetLibraryDetailExtendedQueryVar
} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import LibraryHome from './LibraryHome';

jest.mock('components/LibraryItemsList', () => {
    return function LibraryItemsList() {
        return <div>LibraryItemsList</div>;
    };
});

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock('../../hooks/LangHook/LangHook');

const mockUpdateActiveLib = jest.fn();
jest.mock('../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, mockUpdateActiveLib]
}));

describe('Search', () => {
    const mockStoreState: Partial<RootState> = {
        notification: {
            base: {
                content: 'base notification',
                type: NotificationType.basic
            },
            stack: []
        }
    };
    const mocks = [
        {
            request: {
                query: getLibraryDetailExtendedQuery,
                variables: mockGetLibraryDetailExtendedQueryVar
            },
            result: {
                data: mockGetLibraryDetailExtendedQuery
            }
        }
    ];

    beforeEach(() => jest.clearAllMocks());

    test('Load library research', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStore state={mockStoreState}>
                        <LibraryHome />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        await waitForElement(() => screen.getByText('LibraryItemsList'));

        expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });

    test('Update active library', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStore state={mockStoreState}>
                        <LibraryHome />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        await waitForElement(() => screen.getByText('LibraryItemsList'));

        expect(mockUpdateActiveLib).toBeCalled();
    });
});
