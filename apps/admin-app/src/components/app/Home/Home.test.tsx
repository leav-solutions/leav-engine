// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import Home from './Home';

jest.mock('../Routes', () => {
    return function Routes() {
        return <div>Routes</div>;
    };
});

jest.mock('../AppMenu', () => {
    return function AppMenu() {
        return <div>AppMenu</div>;
    };
});

describe('Home', () => {
    test('Render home', async () => {
        await act(async () => {
            render(<Home />);
        });

        expect(screen.getByText('AppMenu')).toBeInTheDocument();
        expect(screen.getByText('Routes')).toBeInTheDocument();
    });
});
