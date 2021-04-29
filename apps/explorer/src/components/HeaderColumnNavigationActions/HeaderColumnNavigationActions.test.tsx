// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {render, screen, waitForElement} from '@testing-library/react';
import {getActiveTree, IGetActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {navigationInitialState} from 'redux/navigation';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import HeaderColumnNavigationActions from './HeaderColumnNavigationActions';

jest.mock(
    './DefaultActions',
    () =>
        function DefaultActions() {
            return <div>DefaultActions</div>;
        }
);

jest.mock(
    './DetailActions',
    () =>
        function DetailActions() {
            return <div>DetailActions</div>;
        }
);

jest.mock(
    './SelectionActions',
    () =>
        function SelectionActions() {
            return <div>SelectionActions</div>;
        }
);

describe('HeaderColumnNavigationActions', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

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

    test('should call actions', async () => {
        const mockState = {navigation: {...navigationInitialState, path}};
        await act(async () => {
            render(
                <MockedProvider cache={mockCache}>
                    <MockStore state={mockState}>
                        <HeaderColumnNavigationActions depth={1} />
                    </MockStore>
                </MockedProvider>
            );
        });

        waitForElement(() => screen.getByText('DefaultActions'));

        expect(screen.getByText('DefaultActions')).toBeInTheDocument();
        expect(screen.getByText('DetailActions')).toBeInTheDocument();
        expect(screen.getByText('SelectionActions')).toBeInTheDocument();
    });
});
