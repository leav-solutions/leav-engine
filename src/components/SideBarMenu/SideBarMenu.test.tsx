import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import wait from 'waait';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import SideBarMenu from './SideBarMenu';

describe('SideBarMenu', () => {
    const mockCache = new InMemoryCache();

    mockCache.writeQuery({
        query: getActiveLibrary,
        data: {
            activeLibId: 'testLibId',
            activeLibQueryName: 'testLibQueryName',
            activeLibName: 'testLibName',
            activeLibFilterName: 'testLibFilterName'
        }
    });

    const mocks = [
        {
            request: {
                query: getLibrariesListQuery
            },
            result: {
                data: {
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
                }
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

    test('should display label from libraries', async () => {
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

        expect(comp.text()).toContain('testLabel');
    });
});
