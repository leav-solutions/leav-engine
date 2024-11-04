// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MemoryRouter} from 'react-router-dom-v5';
import {act, render, screen} from '_tests/testUtils';
import AppMenu from './AppMenu';

describe('AppMenu', () => {
    test('Render menu', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <AppMenu isCollapsed={false} onToggle={jest.fn()} width="42px" />
                </MemoryRouter>
            );
        });

        expect(screen.getByText(/libraries/)).toBeInTheDocument();
        expect(screen.getByText(/attributes/)).toBeInTheDocument();
        expect(screen.getByText(/trees/)).toBeInTheDocument();
    });
});
