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
jest.mock('_ui/components/RecordEdition/EditRecordModal', () => ({
    EditRecordModal: ({afterCreate}) => {
        mockAfterCreate = afterCreate;
        return <div>{editRecordModalLabel}</div>;
    }
}));

describe('<LibraryItemsListEmpty/>', () => {
    const notifyNewCreationMock = jest.fn();

    let userEvent!: ReturnType<typeof UserEvent.setup>;

    beforeEach(() => {
        userEvent = UserEvent.setup({});
        notifyNewCreationMock.mockClear();
    });

    test('should notify a new creation occurs', async () => {
        render(
            <SearchContext.Provider
                value={{
                    state: {...initialSearchState, library: {id: 'library_test'} as any},
                    dispatch: jest.fn()
                }}
            >
                <LibraryItemsListEmpty notifyNewCreation={notifyNewCreationMock} />
            </SearchContext.Provider>
        );

        await userEvent.click(screen.getByText('items_list.new_record'));

        expect(screen.getByText(editRecordModalLabel)).toBeVisible();

        mockAfterCreate();
        expect(notifyNewCreationMock).toHaveBeenCalledTimes(1);
    });
});
