// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {MemoryRouter} from 'react-router';
import {act, render, screen} from '_tests/testUtils';
import Routes from './Routes';

jest.mock('components/shared/ProtectedRoute', () => {
    return function ProtectedRoute() {
        return <div>ProtectedRoute</div>;
    };
});

jest.mock('components/general/General', () => {
    return function General() {
        return <div>General</div>;
    };
});

jest.mock('../Dashboard', () => {
    return function Dashboard() {
        return <div>Dashboard</div>;
    };
});

jest.mock('components/applications/Applications', () => {
    return function Applications() {
        return <div>Applications</div>;
    };
});

jest.mock('components/applications/EditApplication', () => {
    return function EditApplication() {
        return <div>EditApplication</div>;
    };
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
