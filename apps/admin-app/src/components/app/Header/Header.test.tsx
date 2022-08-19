// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {MemoryRouter} from 'react-router';
import {act, render, screen} from '_tests/testUtils';
import Header from './Header';

describe('Header', () => {
    test('Render menu', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
        });

        expect(screen.getByRole('link', {name: /title/})).toBeInTheDocument();
    });
});
