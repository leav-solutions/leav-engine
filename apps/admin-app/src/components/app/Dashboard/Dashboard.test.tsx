// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {MemoryRouter} from 'react-router';
import {act, render, screen} from '_tests/testUtils';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
    test('Render test', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            );
        });

        expect(screen.getByText(/libraries/)).toBeInTheDocument();
        expect(screen.getByText(/attributes/)).toBeInTheDocument();
        expect(screen.getByText(/trees/)).toBeInTheDocument();
    });
});
