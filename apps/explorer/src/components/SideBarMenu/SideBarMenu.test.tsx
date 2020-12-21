// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import wait from 'waait';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {
    getLibrariesAndTreesListQuery,
    IGetLibrariesAndTreesListQuery
} from '../../queries/LibrariesAndTrees/getLibrariesAndTreesList';
import SideBarMenu from './SideBarMenu';

describe('SideBarMenu', () => {
    const mockCache = new InMemoryCache();

    mockCache.writeQuery({
        query: getActiveLibrary,
        data: {
            activeLib: {
                id: 'testLibId',
                name: 'testLibName',
                filter: 'testLibFilterName',
                gql: {
                    searchableFields: 'testSearchableFields',
                    query: 'testLibQueryName',
                    type: 'testGqlType'
                }
            }
        }
    });

    const queryMocks: IGetLibrariesAndTreesListQuery = {
        trees: {
            list: [
                {
                    id: 'treeId',
                    label: {
                        fr: 'treeLabel',
                        en: 'treeLabel'
                    },
                    libraries: [
                        {
                            id: 'treeLibraryId',
                            label: {
                                fr: 'treeLibraryLabel',
                                en: 'treeLibraryLabel'
                            }
                        }
                    ]
                }
            ]
        },
        libraries: {
            list: [
                {
                    id: 'testId',
                    label: {fr: 'testLabel', en: 'testLabel'},
                    gqlNames: {
                        query: 'testGqlQuery',
                        filter: 'testGqlFilter',
                        searchableFields: 'testGqlSearchableFields'
                    }
                }
            ]
        }
    };

    const mocks = [
        {
            request: {
                query: getLibrariesAndTreesListQuery
            },
            result: {
                data: queryMocks
            }
        }
    ];

    test('should show activeLib content', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <BrowserRouter>
                        <SideBarMenu visible={true} hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );
        });

        expect(comp.text()).toContain('testLibName');
    });

    test('should have sub-menu for libraries and trees', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <BrowserRouter>
                        <SideBarMenu visible={true} hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );

            await wait();

            comp.update();
        });

        expect(comp.text()).toContain('sidebar.recent');
        expect(comp.text()).toContain('sidebar.shortcuts');
        expect(comp.text()).toContain('sidebar.libraries');
        expect(comp.text()).toContain('sidebar.trees');
    });
});
