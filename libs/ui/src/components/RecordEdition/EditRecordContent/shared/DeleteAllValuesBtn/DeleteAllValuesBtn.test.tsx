// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {act, render, screen, waitFor} from '_ui/_tests/testUtils';
import DeleteAllValuesBtn from './DeleteAllValuesBtn';

describe('DeleteAllValuesBtn', () => {
    test('Render test', async () => {
        const mockOnDelete = jest.fn();
        render(<DeleteAllValuesBtn onDelete={mockOnDelete} />);

        const btn = screen.getByRole('button', {name: /delete-all-values/});
        expect(btn).toBeInTheDocument();

        // Click on the parent, because of the issue on Tooltip. See component file
        await userEvent.click(btn.parentElement);

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /delete-confirm-button/}));
        });

        await waitFor(() => expect(mockOnDelete).toBeCalled());
    });
});
