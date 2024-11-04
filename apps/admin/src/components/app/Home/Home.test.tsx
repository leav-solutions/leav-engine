// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import Home from './Home';

jest.mock('../Routes', () => function Routes() {
        return <div>Routes</div>;
    });

jest.mock('../Header', () => function Header() {
        return <div>Header</div>;
    });

jest.mock('../AppMenu', () => function AppMenu() {
        return <div>AppMenu</div>;
    });

jest.mock('../../../constants', () => ({
    APPS_ENDPOINT: '',
    APP_ENDPOINT: ''
}));

describe('Home', () => {
    test('Render home', async () => {
        await act(async () => {
            render(<Home />);
        });

        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('AppMenu')).toBeInTheDocument();
        expect(screen.getByText('Routes')).toBeInTheDocument();
    });
});
