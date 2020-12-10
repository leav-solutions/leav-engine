// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import LibraryItemsList from '.';
import {getLibraryDetailExtendedQuery} from '../../queries/libraries/getLibraryDetailExtendQuery';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import {AttributeType, OrderSearch} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock(
    './SideItems',
    () =>
        function SideItems() {
            return <div>SideItems</div>;
        }
);
jest.mock(
    './TileDisplay',
    () =>
        function TileDisplay() {
            return <div>TileDisplay</div>;
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
jest.mock(
    './DisplayTypeSelector',
    () =>
        function DisplayTypeSelector() {
            return <div>DisplayTypeSelector</div>;
        }
);

describe('LibraryItemsList', () => {
    const libId = 'libIdTest';
    const libQueryName = 'test';
    const libQueryFilter = 'TestFilter';
    const pagination = 20;
    const offset = 0;
    const itemsSortField = 'id';
    const itemsSortOrder = OrderSearch.asc;

    const mocks = [
        {
            request: {
                query: getRecordsFromLibraryQuery(libQueryName, libQueryFilter, [
                    {
                        id: 'testId',
                        library: 'testLib',
                        type: AttributeType.simple
                    }
                ]),
                variables: [
                    {
                        variables: {
                            libId
                        }
                    },
                    {
                        limit: pagination,
                        offset,
                        filters: [],
                        sortField: itemsSortField,
                        sortOrder: itemsSortOrder
                    }
                ]
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
        },
        {
            request: {
                query: getLibraryDetailExtendedQuery,
                variables: {
                    libId
                }
            },
            result: {
                data: {
                    libraries: {
                        list: [
                            {
                                id: 'files',
                                system: true,
                                label: {
                                    fr: 'Fichiers',
                                    en: 'Files'
                                },
                                attributes: [
                                    {
                                        id: 'test',
                                        type: '',
                                        format: '',
                                        label: {
                                            fr: 'Actif',
                                            en: 'Active'
                                        }
                                    }
                                ],
                                gqlNames: {
                                    query: 'files',
                                    filter: 'FileFilter',
                                    searchableFields: 'FileSearchableFields'
                                }
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('should call Child', async () => {
        let comp: any;

        await act(async () => {
            comp = shallow(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <LibraryItemsList />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.html()).toContain('SideItems');
        expect(comp.html()).toContain('MenuItemList');
        expect(comp.html()).toContain('DisplayTypeSelector');
    });
});
