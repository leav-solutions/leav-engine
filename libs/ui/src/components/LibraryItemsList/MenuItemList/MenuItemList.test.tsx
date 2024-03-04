// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import MenuItemList from './MenuItemList';
import {LibraryBehavior} from '_ui/_gqlTypes';
import userEvent from '@testing-library/user-event';

jest.mock('../MenuView', () => () => <div>MenuView</div>);

jest.mock('../MenuSelection', () => () => <div>MenuSelection</div>);

jest.mock('../SearchItems', () => () => <div>SearchItems</div>);

jest.mock('../DisplayOptions', () => () => <div>DisplayOptions</div>);

jest.mock('_ui/components', () => ({
    EditRecordModal: ({afterCreate}) => afterCreate?.(),
    UploadFiles: ({onCompleted}) => onCompleted?.(),
    CreateDirectory: ({onCompleted}) => onCompleted?.()
}));

describe('MenuItemList', () => {
    test('should have MenuView', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuView')).toBeInTheDocument();
    });

    test('should have MenuSelection', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuSelection')).toBeInTheDocument();
    });

    test('should have SearchItems', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(await screen.findByText('SearchItems')).toBeInTheDocument();
    });

    test('should have DisplayOptions', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('DisplayOptions')).toBeInTheDocument();
    });

    describe('notifyNewCreation after creation', () => {
        test.each([LibraryBehavior.standard, LibraryBehavior.files, LibraryBehavior.directories])(
            'refetch callback and success notification are called when props are called in modal %s',
            async behavior => {
                const notifyNewCreation = jest.fn();
                render(
                    <MockSearchContextProvider>
                        <MenuItemList
                            notifyNewCreation={notifyNewCreation}
                            refetch={jest.fn()}
                            library={{...mockGetLibraryDetailExtendedElement, behavior}}
                        />
                    </MockSearchContextProvider>
                );

                await userEvent.click(screen.getByRole('button', {name: 'plus items_list.new'}));

                expect(notifyNewCreation).toHaveBeenCalledTimes(1);
            }
        );
    });
});
