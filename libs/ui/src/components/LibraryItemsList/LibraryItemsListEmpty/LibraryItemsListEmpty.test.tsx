// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import LibraryItemsListEmpty from '_ui/components/LibraryItemsList/LibraryItemsListEmpty/LibraryItemsListEmpty';
import UserEvent from '@testing-library/user-event';
import {initialSearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';

let mockAfterCreate = jest.fn();
const editRecordModalLabel = 'EditRecordModal label';
jest.mock('_ui/components/RecordEdition/EditRecordModal', () => ({afterCreate}) => {
    mockAfterCreate = afterCreate;
    return <div>{editRecordModalLabel}</div>;
});

const kitNotificationMock = {
    success: jest.fn()
};
jest.mock('aristid-ds', () => ({
    ...jest.requireActual('aristid-ds'),
    useKitNotification: () => ({
        kitNotification: kitNotificationMock
    })
}));

describe('<LibraryItemsListEmpty/>', () => {
    const refreshMock = jest.fn();

    let userEvent!: ReturnType<typeof UserEvent.setup>;

    beforeEach(() => {
        userEvent = UserEvent.setup({});
        refreshMock.mockClear();
        kitNotificationMock.success.mockClear();
    });

    test('should notify a new creation occurs', async () => {
        render(
            <SearchContext.Provider
                value={{
                    state: {...initialSearchState, library: {id: 'library_test'} as any},
                    dispatch: jest.fn()
                }}
            >
                <LibraryItemsListEmpty refetch={refreshMock} />
            </SearchContext.Provider>
        );

        await userEvent.click(screen.getByText('items_list.new_record'));

        expect(screen.getByText(editRecordModalLabel)).toBeVisible();

        mockAfterCreate();
        expect(refreshMock).toHaveBeenCalledTimes(1);
        expect(kitNotificationMock.success).toHaveBeenCalledTimes(1);
        expect(kitNotificationMock.success).toHaveBeenCalledWith({
            message: 'items_list.created_in_success.message',
            description: ''
        });
    });
});
