// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
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
                    <MockStore>
                        <MenuItemListSelected active />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText('menu-selection.quit')).toBeInTheDocument();
    });
});
