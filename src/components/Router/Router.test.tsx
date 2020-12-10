// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import SideBarMenu from '../SideBarMenu';
import Router from './Router';
import Routes from './Routes';

jest.mock(
    '../SideBarMenu',
    () =>
        function SideBarMenu() {
            return <div>SideBarMenu</div>;
        }
);

jest.mock(
    '../TopBar',
    () =>
        function TopBar() {
            return <div>TopBar</div>;
        }
);

jest.mock(
    '../UserPanel',
    () =>
        function UserPanel() {
            return <div>UserPanel</div>;
        }
);

jest.mock(
    './Routes',
    () =>
        function Routes() {
            return <div>Routes</div>;
        }
);

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

        expect(comp.find(Routes)).toHaveLength(1);
    });
});
