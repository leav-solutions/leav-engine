// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    test('should display text field and submit button', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <SearchItems />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});
