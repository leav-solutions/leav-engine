// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    test('should display text field and submit button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <SearchItems />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'search'})).toBeInTheDocument();
    });
});
