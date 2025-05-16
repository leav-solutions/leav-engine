// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import LibraryItemsListContent from '_ui/components/LibraryItemsList/LibraryItemsListContent/LibraryItemsListContent';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {LibraryBehavior, SortOrder, ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import userEvent from '@testing-library/user-event';
import {mockPreviews} from '_ui/__mocks__/common/record';
import * as useGetRecordUpdatesSubscription from '_ui/hooks/useGetRecordUpdatesSubscription';
import {getRecordsFromLibraryQuery} from '_ui/_queries/records/getRecordsFromLibraryQuery';

let menuItemListNotifyNewCreationMock;
const labelMenuItemList = 'MenuItemList';
jest.mock('_ui/components/LibraryItemsList/MenuItemList', () => ({notifyNewCreation}) => {
    menuItemListNotifyNewCreationMock = jest.fn(notifyNewCreation);
    return <button onClick={menuItemListNotifyNewCreationMock}>{labelMenuItemList}</button>;
});

let libraryItemsListEmptyNotifyNewCreationMock;
const labelLibraryItemsListEmpty = 'LibraryItemsListEmpty';
jest.mock('_ui/components/LibraryItemsList/LibraryItemsListEmpty', () => ({notifyNewCreation}) => {
    libraryItemsListEmptyNotifyNewCreationMock = jest.fn(notifyNewCreation);
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

jest.spyOn(useGetRecordUpdatesSubscription, 'useGetRecordUpdatesSubscription').mockReturnValue({
    loading: false
});

describe('<LibraryItemsListContent/>', () => {
    describe('creation from <MenuItemList/>', () => {
        const mockGetRecordsFromLibraryQuery = {
            request: {
                query: getRecordsFromLibraryQuery([], true),
                variables: {
                    library: 'my_library',
                    limit: 20,
                    offset: 0,
                    filters: [],
                    sort: {field: 'id', order: SortOrder.asc},
                    fullText: '',
                    version: []
                }
            },
            result: {
                data: {
                    records: {
                        totalCount: 1,
                        list: [
                            {
                                _id: 'id',
                                id: 'id',
                                whoAmI: {
                                    id: 'id',
                                    label: 'label',
                                    subLabel: 'sublabel',
                                    color: null,
                                    preview: mockPreviews,
                                    library: mockLibrarySimple
                                }
                            }
                        ]
                    }
                }
            }
        };

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
                />,
                {
                    mocks: [
                        mockGetRecordsFromLibraryQuery,
                        mockGetRecordsFromLibraryQuery,
                        mockGetRecordsFromLibraryQuery
                    ]
                }
            );

            expect(screen.getByText(labelMenuItemList)).toBeVisible();

            await userEvent.click(screen.getByText(labelMenuItemList));

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
