// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {RootState} from 'redux/store';
import {render, screen, waitForElement} from '_tests/testUtils';
import {NotificationType, WorkspacePanels} from '_types/types';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
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
jest.mock('hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [mockActiveLibrary, mockUpdateActiveLib]
}));

describe('LibraryHome', () => {
    const mockStoreState: Partial<RootState> = {
        notification: {
            base: {
                content: 'base notification',
                type: NotificationType.basic
            },
            stack: []
        },
        activePanel: WorkspacePanels.LIBRARY
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
            render(<LibraryHome library={mockGetLibraryDetailExtendedQueryVar.libId} />, {
                apolloMocks: mocks,
                storeState: mockStoreState
            });
        });

        await waitForElement(() => screen.getByText('LibraryItemsList'));

        expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });

    test('Update active library', async () => {
        await act(async () => {
            render(<LibraryHome library={mockGetLibraryDetailExtendedQueryVar.libId} />, {
                apolloMocks: mocks,
                storeState: mockStoreState
            });
        });

        await waitForElement(() => screen.getByText('LibraryItemsList'));

        expect(mockUpdateActiveLib).toBeCalled();
    });
});
