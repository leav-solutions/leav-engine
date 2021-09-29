// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {act, render, screen} from '_tests/testUtils';
import Workspace from './Workspace';

jest.mock('../Home', () => {
    return function Home() {
        return <div>Home</div>;
    };
});

jest.mock('../LibraryHome', () => {
    return function LibraryHome() {
        return <div>LibraryHome</div>;
    };
});

jest.mock('../Navigation', () => {
    return function Navigation() {
        return <div>Navigation</div>;
    };
});

describe('Workspace', () => {
    test('Render workspace', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Workspace />
                </MemoryRouter>
            );
        });

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('LibraryHome')).toBeInTheDocument();
        expect(screen.getByText('Navigation')).toBeInTheDocument();
    });
});
