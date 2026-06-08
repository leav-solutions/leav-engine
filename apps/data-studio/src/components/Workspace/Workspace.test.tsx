import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {act, render, screen} from '../../_tests/testUtils';
import Workspace from './Workspace';

vi.mock('../Home', () => ({
    default: function Home() {
        return <div>Home</div>;
    },
}));

vi.mock('../LibraryHome', () => ({
    default: function LibraryHome() {
        return <div>LibraryHome</div>;
    },
}));

vi.mock('../Navigation', () => ({
    default: function Navigation() {
        return <div>Navigation</div>;
    },
}));

vi.mock('../Router/RouteNotFound', () => ({
    default: function RouteNotFound() {
        return <div>RouteNotFound</div>;
    },
}));

describe('Workspace', () => {
    test('Render workspace', async () => {
        render(
            <MemoryRouter initialEntries={['/library']}>
                <Routes>
                    <Route path="/:panel" element={<Workspace />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(await screen.findByText('Home')).toBeInTheDocument();
        expect(screen.getByText('LibraryHome')).toBeInTheDocument();
        expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    test('Handle invalid panel', async () => {
        render(
            <MemoryRouter initialEntries={['/bad-route']}>
                <Routes>
                    <Route path="/:panel" element={<Workspace />} />
                </Routes>
            </MemoryRouter>,
        );

        await act(async () => {
            expect(screen.getByText('RouteNotFound')).toBeInTheDocument();
        });

        expect(screen.queryByText('Home')).not.toBeInTheDocument();
        expect(screen.queryByText('LibraryHome')).not.toBeInTheDocument();
        expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });
});
