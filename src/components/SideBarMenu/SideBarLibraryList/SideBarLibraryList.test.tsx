import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import wait from 'waait';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {getLibrariesListQuery} from '../../../queries/libraries/getLibrariesListQuery';
import SideBarLibraryList from './SideBarLibraryList';

describe('SideBarLibraryList', () => {
    test('should display lib name', async () => {
        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getLang,
            data: {
                lang: ['fr']
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
                                    id: 'testIdLib',
                                    label: {
                                        fr: 'testLabelLib',
                                        en: 'testLabelLib'
                                    },
                                    gqlNames: {
                                        query: 'test',
                                        filter: 'test',
                                        searchableFields: 'test'
                                    }
                                },
                                {
                                    id: 'testIdLib2',
                                    label: {
                                        fr: 'testLabelLib2',
                                        en: 'testLabelLib2'
                                    },
                                    gqlNames: {
                                        query: 'test2',
                                        filter: 'test2',
                                        searchableFields: 'test2'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <BrowserRouter>
                        <SideBarLibraryList hide={jest.fn()} />
                    </BrowserRouter>
                </MockedProvider>
            );

            // need to wait to handle the query result
            await wait(0);
            await wait(0);

            comp.update();
        });

        expect(comp.find('NavLink')).toHaveLength(2);
        expect(comp.text()).toContain('testLabelLib');
    });
});
