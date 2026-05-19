import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import Home from './Home';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Outlet: function Outlet() {
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
