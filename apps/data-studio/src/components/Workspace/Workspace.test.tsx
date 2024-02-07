// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MemoryRouter, Route, Routes} from 'react-router-dom';
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

jest.mock('components/Router/RouteNotFound', () => {
    return function RouteNotFound() {
        return <div>RouteNotFound</div>;
    };
});

describe('Workspace', () => {
    test('Render workspace', async () => {
        render(
            <MemoryRouter initialEntries={['/library']}>
                <Routes>
                    <Route path={'/:panel'} element={<Workspace />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('Home')).toBeInTheDocument();
        expect(screen.getByText('LibraryHome')).toBeInTheDocument();
        expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    test('Handle invalid panel', async () => {
        render(
            <MemoryRouter initialEntries={['/bad-route']}>
                <Routes>
                    <Route path={'/:panel'} element={<Workspace />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            expect(screen.getByText('RouteNotFound')).toBeInTheDocument();
        });

        expect(screen.queryByText('Home')).not.toBeInTheDocument();
        expect(screen.queryByText('LibraryHome')).not.toBeInTheDocument();
        expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });
});
