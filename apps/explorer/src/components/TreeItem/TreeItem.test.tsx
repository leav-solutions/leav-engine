// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockTree} from '__mocks__/common/tree';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TreeItem from './TreeItem';

describe('TreeItem', () => {
    test('should display id', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <TreeItem onUpdateFavorite={s => Promise.resolve()} tree={mockTree} />
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText(mockTree.id)).toBeInTheDocument();
    });
});
