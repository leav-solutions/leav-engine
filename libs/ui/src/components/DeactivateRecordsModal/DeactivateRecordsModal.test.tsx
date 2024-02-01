// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {DeactivateRecordsDocument} from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {SearchContext} from '../LibraryItemsList/hooks/useSearchReducer/searchContext';
import {initialSearchState} from '../LibraryItemsList/hooks/useSearchReducer/searchReducer';
import DeactivateRecordsModal from './DeactivateRecordsModal';

describe('DeactivateRecordsModal', () => {
    test('Deactivate records after confirm', async () => {
        const _handleClose = jest.fn();
        const mocks = [
            {
                request: {
                    query: DeactivateRecordsDocument,
                    variables: {libraryId: mockLibraryWithDetails.id, recordsIds: ['1', '2'], filters: null}
                },
                result: {
                    data: {
                        deactivateRecords: [
                            {id: '1', whoAmI: {...mockRecord}},
                            {id: '2', whoAmI: {...mockRecord}}
                        ]
                    }
                }
            }
        ];

        render(
            <SearchContext.Provider
                value={{
                    state: {...initialSearchState, library: mockGetLibraryDetailExtendedElement},
                    dispatch: jest.fn()
                }}
            >
                <DeactivateRecordsModal
                    library={mockLibraryWithDetails.id}
                    selection={{
                        selected: [
                            {
                                id: '1',
                                label: mockRecord.label,
                                library: mockLibraryWithDetails.id
                            },
                            {
                                id: '2',
                                label: mockRecord.label,
                                library: mockLibraryWithDetails.id
                            }
                        ],
                        allSelected: false
                    }}
                    open
                    onClose={_handleClose}
                />
            </SearchContext.Provider>,
            {
                mocks,
                storeState: {
                    ...initialSearchState,
                    selection: {
                        ...initialSearchState.selection,
                        selection: {
                            ...initialSearchState.selection,
                            selected: [
                                {
                                    id: '1',
                                    library: mockGetLibraryDetailExtendedElement.id,
                                    label: mockRecord.label
                                },
                                {
                                    id: '2',
                                    library: mockGetLibraryDetailExtendedElement.id,
                                    label: mockRecord.label
                                }
                            ]
                        }
                    }
                }
            }
        );

        expect(screen.getByText(/confirm/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /submit/}));

        // Run deactivation, display loading
        expect(screen.getByRole('img', {name: /loading/})).toBeInTheDocument();

        await waitFor(() => expect(_handleClose).toBeCalled());
    });

    test('Handle errors', async () => {
        const _handleClose = jest.fn();
        const mocks = [
            {
                request: {
                    query: DeactivateRecordsDocument,
                    variables: {libraryId: mockLibraryWithDetails.id, recordsIds: ['1', '2'], filters: null}
                },
                error: new Error('Boom!')
            }
        ];

        render(
            <SearchContext.Provider
                value={{
                    state: {...initialSearchState, library: mockGetLibraryDetailExtendedElement},
                    dispatch: jest.fn()
                }}
            >
                <DeactivateRecordsModal
                    library={mockLibraryWithDetails.id}
                    selection={{
                        selected: [
                            {
                                id: '1',
                                label: mockRecord.label,
                                library: mockLibraryWithDetails.id
                            },
                            {
                                id: '2',
                                label: mockRecord.label,
                                library: mockLibraryWithDetails.id
                            }
                        ],
                        allSelected: false
                    }}
                    open
                    onClose={_handleClose}
                />
            </SearchContext.Provider>,
            {
                mocks
            }
        );

        await userEvent.click(screen.getByRole('button', {name: /submit/}));

        expect(await screen.findByText(/Boom!/)).toBeInTheDocument();
    });
});
