import {render} from 'enzyme';
import React from 'react';
import LibraryItemsList from '.';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock(
    './Filters',
    () =>
        function Filters() {
            return <div>Filters</div>;
        }
);
jest.mock(
    './ItemsTitleDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);
jest.mock(
    './LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);
jest.mock(
    './MenuItemList',
    () =>
        function MenuItemList() {
            return <div>MenuItemList</div>;
        }
);
jest.mock(
    './MenuItemListSelected',
    () =>
        function MenuItemListSelected() {
            return <div>MenuItemListSelected</div>;
        }
);

describe('LibraryItemsList', () => {
    const libQueryName = 'test';
    const libQueryFilter = 'TestFilter';
    const pagination = 20;
    const offset = 0;

    const mocks = [
        {
            request: {
                query: getRecordsFromLibraryQuery(libQueryName, libQueryFilter, pagination, offset),
                variables: {
                    filters: []
                }
            },
            result: {
                data: {
                    [libQueryName]: {
                        totalCount: 1
                    },
                    libraries: {
                        list: [
                            {
                                id: '31662',
                                label: libQueryFilter,
                                whoAmI: {
                                    id: '31662',
                                    label: 'test',
                                    preview: null,
                                    library: {id: 'test', label: {fr: 'test'}}
                                }
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                <LibraryItemsList />
            </MockedProviderWithFragments>
        );
        expect(comp).toMatchSnapshot();
    });
});
