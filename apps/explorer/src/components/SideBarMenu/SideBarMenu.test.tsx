// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {
    getLibrariesAndTreesListQuery,
    IGetLibrariesAndTreesListQuery
} from '../../queries/LibrariesAndTrees/getLibrariesAndTreesList';
import SideBarMenu from './SideBarMenu';

describe('SideBarMenu', () => {
    const mockQuery = {
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
    };

    const mockCache = new InMemoryCache();
    mockCache.writeQuery(mockQuery);

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
        await act(async () => {
            render(
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <BrowserRouter>
                        <SideBarMenu visible hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );
        });

        await waitForElement(() => screen.getByText('testLibName'));

        const LibraryNameElement = screen.getByText('testLibName');
        expect(LibraryNameElement).toBeInTheDocument();
    });

    test('should have sub-menu for libraries and trees', async () => {
        await act(async () => {
            render(
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <BrowserRouter>
                        <SideBarMenu visible hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );
        });
        const recentElement = screen.getByText('sidebar.recent');
        const shortcutsElement = screen.getByText('sidebar.shortcuts');
        const librariesElement = screen.getByText('sidebar.libraries');
        const treesElement = screen.getByText('sidebar.trees');

        expect(recentElement).toBeInTheDocument();
        expect(shortcutsElement).toBeInTheDocument();
        expect(librariesElement).toBeInTheDocument();
        expect(treesElement).toBeInTheDocument();
    });
});
