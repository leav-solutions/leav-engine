// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {deactivateRecordsMutation} from 'graphQL/mutations/records/deactivateRecordsMutation';
import {SearchContext} from 'hooks/useSearchReducer/searchContext';
import {initialSearchState} from 'hooks/useSearchReducer/searchReducer';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import DeactivateRecordBtn from './DeactivateRecordBtn';

describe('DeactivateRecordBtn', () => {
    test('Render test', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: deactivateRecordsMutation,
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
            {apolloMocks: mocks}
        );

        userEvent.click(screen.getByRole('button', {name: /delete/i}));
        expect(await screen.findByText(/confirm_one/i)).toBeInTheDocument();

        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
