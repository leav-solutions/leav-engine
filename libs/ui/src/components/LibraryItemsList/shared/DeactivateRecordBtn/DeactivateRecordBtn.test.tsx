// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';
import {initialSearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {DeactivateRecordsDocument} from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import DeactivateRecordBtn from './DeactivateRecordBtn';

describe('DeactivateRecordBtn', () => {
    test('Render test', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: DeactivateRecordsDocument,
                    variables: {
                        libraryId: mockRecord.library.id,
                        recordsIds: [mockRecord.id]
                    }
                },
                result: () => {
                    mutationCalled = true;
                    return {
                        data: {
                            deactivateRecords: [{id: '1'}, {id: '2'}]
                        }
                    };
                }
            }
        ];

        render(
            <SearchContext.Provider value={{state: initialSearchState, dispatch: jest.fn()}}>
                <DeactivateRecordBtn record={mockRecord} />
            </SearchContext.Provider>,
            {mocks}
        );

        userEvent.click(screen.getByRole('button', {name: /delete/i}));
        expect(await screen.findByText(/confirm_one/i)).toBeInTheDocument();

        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
