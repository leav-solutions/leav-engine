// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import ActiveHeaderCellNavigation from './ActiveHeaderCellNavigation';

describe('ActiveHeaderCellNavigation', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

    test('should have button and dropdown', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateNavigation stateNavigation={{path}}>
                        <ActiveHeaderCellNavigation depth={1} />
                    </MockStateNavigation>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByTestId('add-tree-element-button')).toBeInTheDocument();
        expect(screen.getByTestId('tree-actions-dropdown')).toBeInTheDocument();
    });
});
