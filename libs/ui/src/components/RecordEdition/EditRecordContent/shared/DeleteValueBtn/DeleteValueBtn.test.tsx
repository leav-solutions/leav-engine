// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import DeleteValueBtn from './DeleteValueBtn';

describe('DeleteValue', () => {
    const _handleDelete = jest.fn();
    test('Display delete with a confirmation message', async () => {
        render(<DeleteValueBtn onDelete={_handleDelete} />);

        const deleteBtn = screen.getByRole('button', {name: 'delete-value'});
        expect(deleteBtn).toBeInTheDocument();

        userEvent.click(deleteBtn);

        expect(await screen.findByText(/delete_value_confirm/)).toBeInTheDocument();

        const submitBtn = screen.getByRole('button', {name: 'delete-confirm-button'});

        userEvent.click(submitBtn);

        await waitFor(() => expect(_handleDelete).toBeCalled());
    });
});
