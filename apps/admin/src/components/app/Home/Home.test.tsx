// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import Home from './Home';

jest.mock('../../../modules/routes/InitAdminRouter', () => ({
    InitAdminRouter: function InitAdminRouter() {
        return <div>Routes</div>;
    },
}));

jest.mock(
    '../Header',
    () =>
        function Header() {
            return <div>Header</div>;
        },
);

jest.mock('../../../modules/navigation-menu/NavigationMenu', () => ({
    NavigationMenu: function NavigationMenu() {
        return <div>NavigationMenu</div>;
    },
}));

jest.mock('../../../constants', () => ({
    APP_BASE_URL: '',
}));

describe('Home', () => {
    test('Render home', async () => {
        await act(async () => {
            render(<Home />);
        });

        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('NavigationMenu')).toBeInTheDocument();
        expect(screen.getByText('Routes')).toBeInTheDocument();
    });
});
