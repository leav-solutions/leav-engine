// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {selectionInitialState} from 'redux/selection';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockSharedNavigationSelection, mockSharedSearchSelection} from '__mocks__/common/selection';
import {mockNavigationPath} from '__mocks__/common/treeElements';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import SelectionActions from './SelectionActions';

describe('SelectionActions', () => {
    test('should get all buttons', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore
                        state={{selection: {...selectionInitialState, selection: mockSharedNavigationSelection}}}
                    >
                        <SelectionActions parent={{...mockNavigationPath, id: 'different-parent-id'}} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByRole('button')).toHaveLength(3);
        expect(screen.getByRole('button', {name: /add-elements-in-tree/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /navigation.actions.move-selected/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /navigation.actions.detach-selected/i})).toBeInTheDocument();
    });

    test('should get only detach button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore
                        state={{selection: {...selectionInitialState, selection: mockSharedNavigationSelection}}}
                    >
                        <SelectionActions parent={mockNavigationPath} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', {name: /navigation.actions.detach-selected/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /navigation.actions.move-selected/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /add-elements-in-tree/i})).not.toBeInTheDocument();
    });

    test('should get only add button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore state={{selection: {...selectionInitialState, selection: mockSharedSearchSelection}}}>
                        <SelectionActions parent={mockNavigationPath} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', {name: /add-elements-in-tree/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /navigation.actions.move-selected/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /navigation.actions.detach-selected/i})).not.toBeInTheDocument();
    });
});
