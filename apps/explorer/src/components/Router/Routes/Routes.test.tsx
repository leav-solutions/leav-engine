// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {act, render, screen} from '_tests/testUtils';
import Routes from './Routes';

jest.mock(
    '../RouteNotFound',
    () =>
        function RouteNotFound() {
            return <div>RouteNotFound</div>;
        }
);

jest.mock('../../Workspace', () => {
    return function Workspace() {
        return <div>Workspace</div>;
    };
});

describe('Routes', () => {
    test('404 call notFound', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/fakeUrl']}>
                    <Routes />
                </MemoryRouter>
            );
        });

        expect(screen.getByText('RouteNotFound')).toBeInTheDocument();
    });

    test('default url call Workspace', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Routes />
                </MemoryRouter>
            );
        });

        expect(screen.getByText('Workspace')).toBeInTheDocument();
    });
});
