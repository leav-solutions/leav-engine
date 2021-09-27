// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
    test('Sidebar', async () => {
        await act(async () => {
            render(<Sidebar />);
        });

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /home/})).toBeInTheDocument();
        expect(screen.getByRole('menuitem', {name: /library/})).toBeInTheDocument();
        expect(screen.getByRole('menuitem', {name: /tree/})).toBeInTheDocument();

        await act(async () => {
            userEvent.hover(screen.getByRole('menuitem', {name: /library/}), null);
        });
    });
});
