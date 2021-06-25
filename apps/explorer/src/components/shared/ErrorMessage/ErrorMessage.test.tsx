// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    const _handleClose = jest.fn();
    test('Display error message', async () => {
        await act(async () => {
            render(<ErrorMessage error="my error" onClose={_handleClose} />);
        });

        expect(screen.getByText('my error')).toBeInTheDocument();
    });

    test('Can close message', async () => {
        await act(async () => {
            render(<ErrorMessage error="my error" onClose={_handleClose} />);
        });

        const closeButton = screen.getByRole('button', {name: 'close'});
        userEvent.click(closeButton);

        expect(_handleClose).toBeCalled();
    });
});
