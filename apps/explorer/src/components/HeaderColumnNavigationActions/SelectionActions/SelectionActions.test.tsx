// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {mockNavigationPath} from '__mocks__/Navigation/mockTreeElements';
import {mockSharedNavigationSelection, mockSharedSearchSelection} from '__mocks__/stateFilters/mockSharedSelection';
import {MockStateShared} from '__mocks__/stateShared/mockStateShared';
import SelectionActions from './SelectionActions';

describe('SelectionActions', () => {
    test('should get buttons', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateShared stateShared={{selection: mockSharedNavigationSelection}}>
                        <SelectionActions parent={mockNavigationPath} depth={0} />
                    </MockStateShared>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByRole('button')).toHaveLength(3);
        expect(screen.getByRole('button', {name: /add-elements-in-tree/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /navigation.actions.move-selected/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /navigation.actions.detach-selected/i})).toBeInTheDocument();
    });

    test('should get only add button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateShared stateShared={{selection: mockSharedSearchSelection}}>
                        <SelectionActions parent={mockNavigationPath} depth={0} />
                    </MockStateShared>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', {name: /add-elements-in-tree/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /navigation.actions.move-selected/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /navigation.actions.detach-selected/i})).not.toBeInTheDocument();
    });
});
