// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MemoryRouter} from 'react-router-dom-v5';
import {act, render, screen} from '_tests/testUtils';
import Routes from './Routes';

jest.mock('components/shared/ProtectedRoute', () => function ProtectedRoute() {
        return <div>ProtectedRoute</div>;
    });

jest.mock('components/general/General', () => function General() {
        return <div>General</div>;
    });

jest.mock('../Dashboard', () => function Dashboard() {
        return <div>Dashboard</div>;
    });

jest.mock('components/applications/Applications', () => function Applications() {
        return <div>Applications</div>;
    });

jest.mock('components/applications/EditApplication', () => function EditApplication() {
        return <div>EditApplication</div>;
    });

describe('Routes', () => {
    test('Render test', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Routes />
                </MemoryRouter>
            );
        });

        expect(screen.getAllByText('ProtectedRoute').length).toBeGreaterThanOrEqual(1);
    });
});
