// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import UserEvent from '@testing-library/user-event';
import {initialSearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {SearchContext} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchContext';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {CreateNewRecordButton} from '_ui/components/LibraryItemsList/CreateNewRecordButton/CreateNewRecordButton';

jest.mock('_ui/components', () => ({
    EditRecordModal: ({onCreate}) => onCreate?.(),
    UploadFiles: ({onCompleted}) => onCompleted?.(),
    CreateDirectory: ({onCompleted}) => onCompleted?.()
}));

describe('<CreateNewRecordButton/>', () => {
    const notifyNewCreationMock = jest.fn();

    let userEvent!: ReturnType<typeof UserEvent.setup>;

    beforeEach(() => {
        userEvent = UserEvent.setup({});
        notifyNewCreationMock.mockClear();
    });

    describe('notifyNewCreation after creation', () => {
        test.each([LibraryBehavior.standard, LibraryBehavior.files, LibraryBehavior.directories])(
            'refetch callback and success notification are called when props are called in modal %s',
            async behavior => {
                const labelButton = 'create';
                render(
                    <SearchContext.Provider
                        value={{
                            state: {
                                ...initialSearchState,
                                library: {id: mockGetLibraryDetailExtendedElement.id} as any
                            },
                            dispatch: jest.fn()
                        }}
                    >
                        <CreateNewRecordButton
                            label={labelButton}
                            libraryId={mockGetLibraryDetailExtendedElement.id}
                            libraryBehavior={behavior}
                            valuesVersions={initialSearchState.valuesVersions}
                            notifyNewCreation={notifyNewCreationMock}
                        />
                    </SearchContext.Provider>
                );

                await userEvent.click(screen.getByRole('button', {name: `plus ${labelButton}`}));

                expect(notifyNewCreationMock).toHaveBeenCalledTimes(1);
            }
        );
    });
});
