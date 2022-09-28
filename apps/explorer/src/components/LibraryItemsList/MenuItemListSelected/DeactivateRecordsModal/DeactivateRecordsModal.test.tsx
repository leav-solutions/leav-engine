// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {deactivateRecordsMutation} from 'graphQL/mutations/records/deactivateRecordsMutation';
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import {initialSearchState} from 'hooks/useSearchReducer/searchReducer';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockInitialState} from '__mocks__/common/mockRedux/mockInitialState';
import {mockRecord} from '__mocks__/common/record';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import DeactivateRecordsModal from './DeactivateRecordsModal';

describe('DeactivateRecordsModal', () => {
    test('Deactive records after confirm', async () => {
        const _handleClose = jest.fn();
        const mocks = [
            {
                request: {
                    query: deactivateRecordsMutation,
                    variables: {
                        libraryId: mockGetLibraryDetailExtendedElement.id,
                        recordsIds: ['1', '2'],
                        filters: null
                    }
                },
                result: {
                    data: {
                        deactivateRecords: [{id: '1'}, {id: '2'}]
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
                <DeactivateRecordsModal open onClose={_handleClose} />
            </SearchContext.Provider>,
            {
                apolloMocks: mocks,
                storeState: {
                    ...mockInitialState,
                    selection: {
                        ...mockInitialState.selection,
                        selection: {
                            ...mockInitialState.selection.selection,
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

        expect(screen.getByText(/confirm\|2/)).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /submit/}));

        // Run deactivation, display loading
        expect(screen.getByTestId(/loading/)).toBeInTheDocument();

        await waitFor(() => expect(_handleClose).toBeCalled());
    });

    test('Handle errors', async () => {
        const _handleClose = jest.fn();
        const mocks = [
            {
                request: {
                    query: deactivateRecordsMutation,
                    variables: {
                        libraryId: mockGetLibraryDetailExtendedElement.id,
                        recordsIds: [],
                        filters: null
                    }
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
                <DeactivateRecordsModal open onClose={_handleClose} />
            </SearchContext.Provider>,
            {
                apolloMocks: mocks
            }
        );

        userEvent.click(screen.getByRole('button', {name: /submit/}));

        expect(await screen.findByText(/Boom!/)).toBeInTheDocument();
    });
});
