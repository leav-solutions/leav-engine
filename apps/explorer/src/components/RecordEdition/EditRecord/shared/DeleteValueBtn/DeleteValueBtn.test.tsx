// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import DeleteValueBtn from './DeleteValueBtn';

describe('DeleteValue', () => {
    const _handleDelete = jest.fn();
    test('Display delete with a confirmation message', async () => {
        await act(async () => {
            render(<DeleteValueBtn onDelete={_handleDelete} />);
        });

        const deleteBtn = screen.getByRole('button', {name: 'delete-value'});
        expect(deleteBtn).toBeInTheDocument();

        userEvent.click(deleteBtn);

        expect(screen.getByText(/delete_value_confirm/)).toBeInTheDocument();

        const submitBtn = screen.getByRole('button', {name: 'delete-confirm-button'});

        userEvent.click(submitBtn);

        expect(_handleDelete).toBeCalled();
    });
});
