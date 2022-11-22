// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {act, render, screen} from '_tests/testUtils';
import DeleteAllValuesBtn from './DeleteAllValuesBtn';

describe('DeleteAllValuesBtn', () => {
    test('Render test', async () => {
        const mockOnDelete = jest.fn();
        render(<DeleteAllValuesBtn onDelete={mockOnDelete} />);

        const btn = screen.getByRole('button', {name: /delete-all-values/});
        expect(btn).toBeInTheDocument();

        userEvent.click(btn);
        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /delete-confirm-button/}));
        });

        expect(mockOnDelete).toBeCalled();
    });
});
