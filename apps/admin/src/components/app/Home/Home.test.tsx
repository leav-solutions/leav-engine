import {act, render, screen} from '../../../_tests/testUtils';
import Home from './Home';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    Outlet: function Outlet() {
        return <div>Routes</div>;
    },
}));

vi.mock('../../../modules/layout/Header', () => ({
    Header: function Header() {
        return <div>Header</div>;
    },
}));

vi.mock('../../../modules/navigation-menu/NavigationMenu', () => ({
    NavigationMenu: function NavigationMenu() {
        return <div>NavigationMenu</div>;
    },
}));

vi.mock('../../../constants', () => ({
    APP_BASE_URL: '',
    GLOBAL_BASE_URL: '',
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
