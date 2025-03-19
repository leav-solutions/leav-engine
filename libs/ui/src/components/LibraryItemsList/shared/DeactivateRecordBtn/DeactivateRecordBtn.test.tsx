// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';
import {initialSearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {DeactivateRecordsDocument} from '_ui/_gqlTypes';
import {act, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import DeactivateRecordBtn from './DeactivateRecordBtn';
import {KitApp} from 'aristid-ds';
import {App} from 'antd';

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
            <App>
                <SearchContext.Provider value={{state: initialSearchState, dispatch: jest.fn()}}>
                    <DeactivateRecordBtn record={mockRecord} />
                </SearchContext.Provider>
            </App>,
            {mocks}
        );

        await act(async () => {
            await userEvent.click(screen.getByRole('button', {name: /delete/i}));
        });
        expect(await screen.findByText(/confirm_one/i)).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByText(/submit/i));
        });

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
