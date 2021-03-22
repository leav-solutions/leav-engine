// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '__mocks__/stateItems/mockStateItems';
import MenuSelection from './MenuSelection';

describe('MenuSelection', () => {
    test('should display a dropdown', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <MenuSelection />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByRole('dropdown')).toBeInTheDocument();
        expect(screen.queryByText(/items-list-row.nb-elements/i)).toBeInTheDocument();
    });
});
