import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter, Route} from 'react-router-dom';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import SideBarMenu from '../SideBarMenu';
import Router from './Router';

describe('Router', () => {
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
                                id: 'test',
                                label: 'test',
                                gqlNames: {
                                    query: 'test',
                                    filter: 'TestFilter',
                                    searchableFields: 'TestSearchableFields'
                                }
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('should add a router', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <Router />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(BrowserRouter)).toHaveLength(1);
    });

    test('should call Sidebar', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <Router />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(SideBarMenu)).toHaveLength(1);
    });

    test('should call Route', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <Router />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Route)).toHaveLength(1);
    });
});
