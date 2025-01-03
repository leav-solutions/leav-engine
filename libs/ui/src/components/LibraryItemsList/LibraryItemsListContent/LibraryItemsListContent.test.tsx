// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import LibraryItemsListContent from '_ui/components/LibraryItemsList/LibraryItemsListContent/LibraryItemsListContent';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {LibraryBehavior, SortOrder, ViewSizes, ViewTypes} from '_ui/_gqlTypes';

let menuItemListNotifyNewCreationMock = jest.fn();
const labelMenuItemList = 'MenuItemList';
jest.mock('_ui/components/LibraryItemsList/MenuItemList', () => ({notifyNewCreation}) => {
    menuItemListNotifyNewCreationMock = notifyNewCreation;
    return <div>{labelMenuItemList}</div>;
});

let libraryItemsListEmptyNotifyNewCreationMock = jest.fn();
const labelLibraryItemsListEmpty = 'LibraryItemsListEmpty';
jest.mock('_ui/components/LibraryItemsList/LibraryItemsListEmpty', () => ({notifyNewCreation}) => {
    libraryItemsListEmptyNotifyNewCreationMock = notifyNewCreation;
    return <div>{labelLibraryItemsListEmpty}</div>;
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

describe('<LibraryItemsListContent/>', () => {
    describe('creation from <MenuItemList/>', () => {
        test('should refresh and notify', async () => {
            render(
                <LibraryItemsListContent
                    library={
                        {
                            ...mockLibrarySimple,
                            system: true,
                            behavior: LibraryBehavior.standard,
                            attributes: [],
                            permissions: {
                                create_record: true
                            },
                            linkedTrees: []
                        } as any
                    }
                    defaultView={{
                        id: '0',
                        label: {en: 'My view 1', fr: 'My view 1'},
                        display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
                        color: '#50F0C4',
                        shared: false,
                        filters: [],
                        owner: true,
                        sort: [
                            {
                                field: 'id',
                                order: SortOrder.asc
                            }
                        ]
                    }}
                />
            );

            expect(screen.getByText(labelMenuItemList)).toBeVisible();

            menuItemListNotifyNewCreationMock();
            expect(kitNotificationMock.success).toHaveBeenCalledTimes(1);
            expect(kitNotificationMock.success).toHaveBeenCalledWith({
                message: 'items_list.created_in_success.message',
                description: ''
            });
        });
    });

    describe('creation from <LibraryItemsListEmpty/>', () => {
        test.todo('should refresh and notify');
    });
});
