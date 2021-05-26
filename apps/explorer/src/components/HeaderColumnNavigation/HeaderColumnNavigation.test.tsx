// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {navigationInitialState} from 'redux/navigation';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {getActiveTree, IGetActiveTree} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import HeaderColumnNavigation from './HeaderColumnNavigation';

jest.mock(
    '../HeaderColumnNavigationActions',
    () =>
        function HeaderColumnNavigationActions() {
            return <div>HeaderColumnNavigationActions</div>;
        }
);

describe('HeaderColumnNavigation', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

    test('should display parent Label', async () => {
        const mockState = {navigation: {...navigationInitialState, path}};
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore state={mockState}>
                        <HeaderColumnNavigation depth={1} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(await screen.findByText(path[0].label)).toBeInTheDocument();
    });

    test('should display activeTreeLabel', async () => {
        const mockActiveTree: IGetActiveTree = {
            activeTree: {
                id: 'treeId',
                label: 'treeLabel',
                libraries: [{id: 'libId'}]
            }
        };

        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getActiveTree,

            data: {
                ...mockActiveTree
            }
        });

        const mockState = {navigation: {...navigationInitialState, path}};

        await act(async () => {
            render(
                <MockedProvider cache={mockCache}>
                    <MockStore state={mockState}>
                        <HeaderColumnNavigation depth={0} />
                    </MockStore>
                </MockedProvider>
            );
        });

        expect(await screen.findByText(mockActiveTree.activeTree?.label)).toBeInTheDocument();
    });

    test('should use HeaderColumnNavigationActions', async () => {
        const mockState = {navigation: {...navigationInitialState, path}};

        render(
            <MockedProviderWithFragments>
                <MockStore state={mockState}>
                    <HeaderColumnNavigation depth={1} isActive={true} />
                </MockStore>
            </MockedProviderWithFragments>
        );

        expect(await screen.findByText('HeaderColumnNavigationActions')).toBeInTheDocument();
    });
});
