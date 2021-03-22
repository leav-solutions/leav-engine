// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import MenuItemListSelected from './MenuItemListSelected';

jest.mock('./ActionsMenu', () => {
    return function ActionsMenu() {
        return <div>ActionsMenu</div>;
    };
});

describe('MenuItemListSelected', () => {
    test('should have quit mode selection button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <MenuItemListSelected active />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText('menu-selection.quit')).toBeInTheDocument();
    });
});
